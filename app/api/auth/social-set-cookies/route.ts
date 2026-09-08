import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/social-set-cookies
 *
 * Called by AuthProvider after a successful Google OAuth sign-in.
 *
 * Purpose:
 *   Sets the accessToken and refreshToken as HTTP-only cookies on the
 *   SAME ORIGIN as the frontend (www.mirvory.net).
 *
 * Why same-origin matters:
 *   Cookies set on www.mirvory.net are automatically sent by the browser
 *   on every request to the same origin, including /api/* paths that are
 *   proxied by Next.js to the Railway backend.  This avoids the
 *   cross-site (SameSite=Lax) restriction that would block cookies from
 *   being sent to the Railway domain directly.
 *
 * Security note:
 *   This route only performs a basic JWT structure check (three base64url
 *   segments separated by dots).  Full cryptographic verification is done
 *   by the Railway backend auth middleware on every authenticated request.
 *   We intentionally do NOT expose JWT_SECRET to the Next.js frontend.
 */

/** Minimal structural check: must be three dot-separated base64url segments */
function looksLikeJwt(value: string): boolean {
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const b64url = /^[A-Za-z0-9\-_]+$/;
  return parts.every((p) => b64url.test(p));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken, role } = body;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { success: false, message: 'accessToken and refreshToken are required' },
        { status: 400 }
      );
    }

    // Basic structure validation — never log the actual token values
    if (!looksLikeJwt(accessToken) || !looksLikeJwt(refreshToken)) {
      console.warn('[social-set-cookies] Rejected: malformed token structure');
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 400 }
      );
    }

    const isProd = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({ success: true });

    // accessToken — short-lived, HTTP-only, same-site
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes — matches typical backend JWT_EXPIRE
    });

    // refreshToken — longer-lived, HTTP-only, same-site
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 20 * 24 * 60 * 60, // 20 days — matches typical JWT_REFRESH_EXPIRE
    });

    // userRole — not HTTP-only so client JS can read it for UI decisions
    if (role && typeof role === 'string') {
      response.cookies.set('userRole', role, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 20 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    // Log the error type but never the token value
    console.error('[social-set-cookies] Error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
