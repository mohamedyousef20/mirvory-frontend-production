/**
 * POST /api/auth/set-token
 *
 * PRIMARY FIX for the Railway-cookie domain mismatch problem.
 *
 * ─── Root Cause ───────────────────────────────────────────────────────────────
 * Railway backend's res.cookie() has NO Domain attribute.
 * Browser rule: no Domain → cookie scoped to EXACT response domain only.
 * Next.js middleware runs on Vercel — request.cookies.get("accessToken") = undefined
 * → Middleware redirects to /auth/login on every request.
 *
 * ─── Fix ──────────────────────────────────────────────────────────────────────
 * Login page calls this Next.js API route (same origin as Vercel frontend)
 * BEFORE navigating. This route sets accessToken + refreshToken cookies on the
 * VERCEL domain. Middleware then sees them correctly.
 *
 * ─── Security ─────────────────────────────────────────────────────────────────
 * - Origin validation: only accepts requests from the same Vercel origin.
 * - JWT structure validation: verifies the accessToken is a well-formed JWT
 *   before storing it as a cookie (prevents arbitrary string injection).
 * - httpOnly cookies: tokens are NOT accessible from JavaScript.
 * - SameSite=lax: safe for same-origin login flow.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Validates that a string is a structurally valid JWT
 * (header.payload.signature format with base64url encoding).
 * If JWT_SECRET is available, verifies the signature as well.
 */
async function isValidJwt(token: string): Promise<boolean> {
  // Step 1: Structural check — must have exactly 3 parts separated by '.'
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // Step 2: Each part must be non-empty base64url
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  if (!parts.every((p) => p.length > 0 && base64urlPattern.test(p))) {
    return false;
  }

  // Step 3: If JWT_SECRET is set, verify the actual signature
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    try {
      const secretKey = new TextEncoder().encode(jwtSecret);
      await jwtVerify(token, secretKey);
    } catch {
      // Signature invalid or token expired — reject
      return false;
    }
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    // ─── CSRF / Origin Validation ─────────────────────────────────────────────
    // Only accept requests from the same Vercel origin (same-site login flow).
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin) {
      const allowedOrigins = [
        `https://${host}`,
        `http://${host}`,
        'http://localhost:3000',
        'http://localhost:3001',
      ];

      if (!allowedOrigins.includes(origin)) {
        return NextResponse.json(
          { success: false, message: 'Origin not allowed' },
          { status: 403 }
        );
      }
    }

    // ─── Parse Body ───────────────────────────────────────────────────────────
    const body = await request.json();
    const { accessToken, refreshToken, role } = body;

    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json(
        { success: false, message: 'accessToken is required' },
        { status: 400 }
      );
    }

    // ─── JWT Format / Signature Validation ───────────────────────────────────
    const tokenValid = await isValidJwt(accessToken);
    if (!tokenValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Validate refreshToken format if provided
    if (refreshToken !== undefined && refreshToken !== null) {
      if (typeof refreshToken !== 'string' || refreshToken.split('.').length !== 3) {
        return NextResponse.json(
          { success: false, message: 'Invalid refreshToken format' },
          { status: 400 }
        );
      }
    }

    const isProd = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({ success: true, message: 'Cookies set on Vercel domain' });

    // Set accessToken cookie on the VERCEL domain (same origin as this route)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes — matches backend JWT_EXPIRE default
    });

    if (refreshToken) {
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days — matches backend COOKIE_REFRESH_EXPIRE default
      });
    }

    if (role && typeof role === 'string') {
      // Non-HttpOnly so client JS can read it for UI decisions
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
