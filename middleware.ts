import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = ["/account", "/vendor", "/admin", "/driver"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pure-courtesy-production-8cb1.up.railway.app';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  const JWT_SECRET = process.env.JWT_SECRET;

  // تجاوز الفحص عند غياب المفتاح (لتفادي Loops في Vercel)
  if (!JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET not set – skipping edge token verification");
    return NextResponse.next();
  }

  const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

  let token = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

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
    const userRole = (decoded.role || "").toLowerCase();

    // 1. تفعيل حماية الأدوار بالكامل (RBAC)
    const adminRoles = ["admin", "super_admin"];
    if (pathname.startsWith("/admin") && !adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // RBAC: vendor and driver route guards
    // NOTE: These guards redirect to /unauthorized — ensure that route exists.
    if (pathname.startsWith("/vendor") && decoded.role !== "seller") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/driver") && decoded.role !== "driver") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

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

    // 2. تجديد التوكن تلقائياً مع إصلاح كتابة الكوكي
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
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.accessToken;

          if (newToken) {
            const { payload } = await jwtVerify(newToken, SECRET_KEY);
            const decoded: any = payload;

            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("x-user-id", decoded.id);
            requestHeaders.set("x-user-role", decoded.role);
            requestHeaders.set("x-user-email", decoded.email);

            const response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });

            // Set the refreshed accessToken directly on the Vercel response.
            // We do NOT forward Railway's Set-Cookie headers — those are
            // railway.app-scoped and the browser would not send them to Vercel.
            // Since we already verified newToken above, we set it ourselves.
            const isProd = process.env.NODE_ENV === 'production';
            response.cookies.set('accessToken', newToken, {
              httpOnly: true,
              secure: isProd,
              sameSite: 'lax',
              path: '/',
              maxAge: 15 * 60, // 15 minutes
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
  matcher: [
    "/account/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/driver/:path*",
  ],
};
