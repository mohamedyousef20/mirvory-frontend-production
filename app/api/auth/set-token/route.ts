/**
 * POST /api/auth/set-token
 *
 * PRIMARY FIX for the Railway-cookie domain mismatch problem.
 *
 * ─── Root Cause ───────────────────────────────────────────────────────────────
 * Railway backend's res.cookie() has NO Domain attribute.
 * Browser rule: no Domain → cookie scoped to EXACT response domain only
 * (pure-courtesy-production-8cb1.up.railway.app).
 *
 * Next.js middleware runs on Vercel's domain.
 * request.cookies.get("accessToken") = undefined (browser never sends
 * Railway-scoped cookies to Vercel requests).
 * → Middleware redirects to /auth/login every time.
 *
 * ─── Fix ──────────────────────────────────────────────────────────────────────
 * Login page calls this Next.js API route (same origin as Vercel frontend)
 * BEFORE navigating. This route sets accessToken + refreshToken cookies on the
 * VERCEL domain. Middleware then sees them correctly.
 *
 * The tokens are extracted from the Railway login response body (not cookies),
 * which is why we need the backend to return them in the JSON body too.
 * The backend already returns: { success: true, data: { user: { id, role } } }
 * but does NOT return the tokens in the body — only via Set-Cookie.
 *
 * IMPORTANT: We accept the tokens as POST body from the login page, which
 * reads them from the Axios response (the backend must include them in the
 * response body for this pattern to work — see backend note below).
 *
 * Alternative (if backend can't be changed): The login page reads the
 * Set-Cookie header from the Railway response via document.cookie after the
 * cross-origin request — but HttpOnly cookies are NOT readable by JS.
 *
 * THEREFORE: This route accepts tokens passed explicitly from login page.
 * The login page must get them from the response body (requires backend change)
 * OR the backend must expose a separate endpoint that returns tokens in body.
 *
 * ─── Current interim solution ─────────────────────────────────────────────────
 * This route sets cookies from whatever tokens the login page passes to it.
 * Login page is updated to call this route right after successful login,
 * passing any tokens received in response.data (if backend includes them).
 *
 * If backend does NOT include tokens in body, this route acts as a bridge for
 * the Google OAuth flow (already working via social-set-cookies).
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken, role } = body;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'accessToken is required' },
        { status: 400 }
      );
    }

    const isProd = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({ success: true, message: 'Cookies set on Vercel domain' });

    // Set accessToken cookie on the VERCEL domain (same origin as this route)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      // lax is fine here — this is the SAME origin (Vercel) setting the cookie
      // so SameSite=None is not needed (that's only for cross-origin requests)
      sameSite: 'lax',
      path: '/',
      // 15 minutes (900 seconds) — should match backend JWT_EXPIRE
      // TODO: align with process.env.COOKIE_EXPIRE when exposed as NEXT_PUBLIC
      maxAge: 15 * 60,
    });

    if (refreshToken) {
      // Set refreshToken cookie on the VERCEL domain
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        // 7 days — should match backend COOKIE_REFRESH_EXPIRE
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    if (role) {
      // Non-HttpOnly so client JS can read it for UI decisions (e.g. showing
      // vendor-only links without an extra API call)
      response.cookies.set('userRole', role, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error('[set-token] Error setting cookies:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
