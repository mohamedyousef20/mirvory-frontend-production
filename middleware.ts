// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = ["/account", "/vendor", "/admin", "/driver"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  let refreshToken = request.cookies.get("refreshToken")?.value;

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

    // 🔄 AUTO REFRESH: Try to refresh token if it's expired
    if (error.code === 'ERR_JWT_EXPIRED' && refreshToken) {
      try {
        console.log("🔄 Attempting token refresh...");
        const refreshResponse = await fetch(`${API_URL}/api/users/refresh-token`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Cookie': request.headers.get('cookie') || ''
          }
        });

        if (refreshResponse.ok) {
          console.log("✅ Token refreshed successfully");
          // Get new token from response body (not from cookies)
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.accessToken;

          if (newToken) {
            const { payload } = await jwtVerify(newToken, SECRET_KEY);
            const decoded: any = payload;

            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("x-user-id", decoded.id);
            requestHeaders.set("x-user-role", decoded.role);
            requestHeaders.set("x-user-email", decoded.email);

            // 🔄 CRITICAL FIX: Set new token in response cookies to prevent infinite refresh loop
            const response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });

            // Extract Set-Cookie headers from refresh response and set them in the response
            const setCookieHeaders = refreshResponse.headers.getSetCookie();
            setCookieHeaders.forEach(cookie => {
              response.cookies.set(cookie);
            });

            return response;
          }
        }
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
      }
    }

    // Clear invalid cookies
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

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