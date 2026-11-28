import { NextResponse } from 'next/server';

export class SessionRefreshError extends Error {
  constructor(public status: number) { super('Session renewal failed'); }
}

/** Server-only. Never return these credentials to browser JavaScript. */
export async function renewSession(cookie: string) {
  let response: Response;
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    response = await fetch(`${base}/api/users/refresh-token`, {
      method: 'POST', headers: { Cookie: cookie }, cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
  } catch { throw new SessionRefreshError(503); }
  if (!response.ok) throw new SessionRefreshError(response.status === 401 ? 401 : 503);
  const data = await response.json();
  if (!data.accessToken || !data.refreshToken) throw new SessionRefreshError(503);
  return data as { accessToken: string; refreshToken: string };
}

export function cookieLifetime(token: string, cap: number): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Math.max(0, Math.min(cap, Math.floor(payload.exp - Date.now() / 1000)));
  } catch { return 0; }
}

export function setSessionCookies(response: NextResponse, tokens: { accessToken: string; refreshToken: string }) {
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
  response.cookies.set('accessToken', tokens.accessToken, { ...options, maxAge: cookieLifetime(tokens.accessToken, 7 * 86400) });
  response.cookies.set('refreshToken', tokens.refreshToken, { ...options, maxAge: cookieLifetime(tokens.refreshToken, 30 * 86400) });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
