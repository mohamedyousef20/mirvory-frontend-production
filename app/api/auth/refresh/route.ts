import { NextRequest, NextResponse } from 'next/server';
import { renewSession, SessionRefreshError, setSessionCookies } from '@/lib/session-refresh';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if ((origin && origin !== request.nextUrl.origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  try {
    const tokens = await renewSession(request.headers.get('cookie') || '');
    return setSessionCookies(NextResponse.json({ success: true }), tokens);
  } catch (error) {
    const status = error instanceof SessionRefreshError ? error.status : 503;
    return NextResponse.json({ success: false }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
