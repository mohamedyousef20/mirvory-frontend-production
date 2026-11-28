import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";
import { renewSession, SessionRefreshError, setSessionCookies } from "@/lib/session-refresh";

// ── Typed JWT payload ────────────────────────────────────────────────────────
interface AppJwtPayload extends JWTPayload {
  id?: string;
  role?: string;
  email?: string;
}

const PROTECTED_ROUTES = ["/account", "/vendor", "/admin", "/driver"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (!isProtected) return NextResponse.next();

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET not set – skipping edge token verification");
    return NextResponse.next();
  }

  const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

  let token = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7);
  }

  if (!token && !refreshToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token || "", SECRET_KEY);
    const decoded = payload as AppJwtPayload;

    // Null-safe extraction — never pass undefined to headers
    const userId = decoded.id ?? "";
    const userRole = (decoded.role ?? "").toLowerCase();
    const userEmail = decoded.email ?? "";

    // ── RBAC guards ──────────────────────────────────────────────────────────
    if (pathname.startsWith("/admin") && !["admin", "super_admin"].includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (pathname.startsWith("/vendor") && userRole !== "seller") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (pathname.startsWith("/driver") && userRole !== "driver") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    const requestHeaders = new Headers(request.headers);
    if (userId) requestHeaders.set("x-user-id", userId);
    if (userRole) requestHeaders.set("x-user-role", userRole);
    if (userEmail) requestHeaders.set("x-user-email", userEmail);

    return NextResponse.next({ request: { headers: requestHeaders } });

  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    // Log code/message only — never log the token value itself
    console.error("❌ Token verification failed:", { code: err.code, message: err.message });

    // Renew before rendering protected pages. No role is trusted until the
    // next request verifies the new access JWT and runs the RBAC checks above.
    if (refreshToken && (!token || err.code === "ERR_JWT_EXPIRED")) {
      try {
        const tokens = await renewSession(request.headers.get("cookie") || "");
        await jwtVerify(tokens.accessToken, SECRET_KEY);
        return setSessionCookies(NextResponse.redirect(request.nextUrl), tokens);
      } catch (refreshError) {
        if (!(refreshError instanceof SessionRefreshError) || refreshError.status !== 401) {
          return new NextResponse("Session renewal temporarily unavailable. Please reload.", {
            status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "5" },
          });
        }
      }
    }

    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }
}

export const config = {
  matcher: ["/account/:path*", "/vendor/:path*", "/admin/:path*", "/driver/:path*"],
};
