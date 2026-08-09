import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/social-set-cookies
 *
 * Called by AuthProvider after a successful Google OAuth sign-in.
 * The backend normally handles this, but we also expose it here as a
 * Next.js route so that:
 *  a) it works even if the backend endpoint is temporarily unavailable, and
 *  b) cookies are set from the same origin as the frontend (avoids SameSite issues).
 *
 * The backend endpoint at NEXT_PUBLIC_API_URL/api/auth/social-set-cookies is tried
 * first by AuthProvider; this route is the fallback.
 */
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

    const isProd = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({ success: true });

    // Set accessToken cookie
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      // 10 day – matches typical access-token TTL
      maxAge: 10 * 24 * 60 * 60,
    });

    // Set refreshToken cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      // 20 days – matches typical refresh-token TTL
      maxAge: 20 * 24 * 60 * 60,
    });

    if (role) {
      response.cookies.set('userRole', role, {
        httpOnly: false, // readable by client JS for UI decisions
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 20 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error('[social-set-cookies] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
