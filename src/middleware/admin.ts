import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export async function adminMiddleware(request: NextRequest) {
  // Get the token from the cookies
  const token = request.cookies.get('accessToken')?.value;

  // If there's no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const decoded: any = payload;

    // Check if user has admin role (admin or super_admin)
    const adminRoles = ['admin', 'super_admin'];
    if (!adminRoles.includes(decoded.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Token verification failed
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: '/admin/:path*',
};
