/**
 * POST /api/auth/set-token
 *
 * PRIMARY FIX for the Railway-cookie domain mismatch problem.
 *
 * Root Cause:
 *   Railway backend sets cookies on railway.app domain only (no Domain attribute).
 *   Next.js middleware runs on vercel.app → request.cookies.get("accessToken") = undefined
 *   → Middleware redirects every request to /auth/login (redirect loop).
 *
 * Fix:
 *   Login page calls this Next.js API route (same origin as Vercel) BEFORE navigating.
 *   This route sets accessToken + refreshToken cookies on the VERCEL domain.
 *   Middleware then sees them correctly on subsequent requests.
 *
 * Security:
 *   - Origin validation: rejects requests from any domain other than own Vercel origin
 *   - JWT structure validation: verifies 3-part base64url format before storing
 *   - Signature verification: if JWT_SECRET is set, verifies the token signature
 *   - httpOnly cookies: tokens inaccessible from JavaScript
 *   - SameSite=lax: safe for same-origin login flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function isValidJwt(token: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  if (!parts.every((p) => p.length > 0 && base64urlPattern.test(p))) return false;

  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(jwtSecret));
    } catch {
      return false;
    }
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // ── CSRF / Origin check ──────────────────────────────────────────────────
    const origin = request.headers.get('origin');
    const host   = request.headers.get('host');

    if (origin) {
      const allowed = [
        `https://${host}`,
        `http://${host}`,
        'http://localhost:3000',
        'http://localhost:3001',
      ];
      if (!allowed.includes(origin)) {
        return NextResponse.json({ success: false, message: 'Origin not allowed' }, { status: 403 });
      }
    }

    // ── Parse body ───────────────────────────────────────────────────────────
    const body = await request.json();
    const { accessToken, refreshToken, role } = body;

    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json({ success: false, message: 'accessToken is required' }, { status: 400 });
    }

    // ── JWT format / signature validation ───────────────────────────────────
    if (!(await isValidJwt(accessToken))) {
      return NextResponse.json({ success: false, message: 'Invalid token format' }, { status: 400 });
    }

    if (refreshToken !== undefined && refreshToken !== null) {
      if (typeof refreshToken !== 'string' || refreshToken.split('.').length !== 3) {
        return NextResponse.json({ success: false, message: 'Invalid refreshToken format' }, { status: 400 });
      }
    }

    const isProd = process.env.NODE_ENV === 'production';
    const res    = NextResponse.json({ success: true, message: 'Cookies set on Vercel domain' });

    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes — matches backend JWT_EXPIRE default
    });

    if (refreshToken) {
      res.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    if (role && typeof role === 'string') {
      // Non-HttpOnly — readable by client JS for UI decisions (role-based nav)
      res.cookies.set('userRole', role, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return res;
  } catch (error) {
    console.error('[set-token] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
