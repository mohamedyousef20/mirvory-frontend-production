// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = ["/account", "/vendor", "/admin", "/driver"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // تحقق من وجود الـ JWT secret
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET is missing in .env.local");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  // Get token from multiple possible sources
  let token = request.cookies.get("accessToken")?.value;

  // If no cookie, check Authorization header
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const decoded: any = payload;
    // Role-based protection
    const adminRoles = ["admin", "super_admin"];
    if (pathname.startsWith("/admin") && !adminRoles.includes(decoded.role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/vendor") && decoded.role !== "seller") {
      // return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/driver") && decoded.role !== "driver") {
      // return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.id);
    requestHeaders.set("x-user-role", decoded.role);
    requestHeaders.set("x-user-email", decoded.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Token verification failed:", {
      error: error.message,
      code: error.code
    });

    // Clear invalid cookie
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");

    return response;
  }
}

export const config = {
  matcher: [
    "/account/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/driver/:path*",
  ],
};