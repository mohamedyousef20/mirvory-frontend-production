import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

// ── Typed JWT payload ────────────────────────────────────────────────────────
interface AppJwtPayload extends JWTPayload {
  id?: string;
  role?: string;
  email?: string;
}

const PROTECTED_ROUTES = ["/account", "/vendor", "/admin", "/driver"];
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://pure-courtesy-production-8cb1.up.railway.app";

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

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const decoded = payload as AppJwtPayload;

    // Null-safe extraction — never pass undefined to headers
    const userId    = decoded.id    ?? "";
    const userRole  = (decoded.role ?? "").toLowerCase();
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
    if (userId)    requestHeaders.set("x-user-id",    userId);
    if (userRole)  requestHeaders.set("x-user-role",  userRole);
    if (userEmail) requestHeaders.set("x-user-email", userEmail);

    return NextResponse.next({ request: { headers: requestHeaders } });

  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    // Log code/message only — never log the token value itself
    console.error("❌ Token verification failed:", { code: err.code, message: err.message });

    // ── Auto-refresh on expiry ───────────────────────────────────────────────
    if (err.code === "ERR_JWT_EXPIRED" && refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/api/users/refresh-token`, {
          method: "POST",
          credentials: "include",
          headers: { Cookie: request.headers.get("cookie") || "" },
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newToken: string | undefined = data.accessToken;

          if (newToken) {
            const { payload } = await jwtVerify(newToken, SECRET_KEY);
            const d = payload as AppJwtPayload;

            const requestHeaders = new Headers(request.headers);
            const uid   = d.id    ?? "";
            const urole = (d.role ?? "").toLowerCase();
            const umail = d.email ?? "";
            if (uid)   requestHeaders.set("x-user-id",    uid);
            if (urole) requestHeaders.set("x-user-role",  urole);
            if (umail) requestHeaders.set("x-user-email", umail);

            const response = NextResponse.next({ request: { headers: requestHeaders } });
            const isProd = process.env.NODE_ENV === "production";
            response.cookies.set("accessToken", newToken, {
              httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 15 * 60,
            });
            return response;
          }
        }
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
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
