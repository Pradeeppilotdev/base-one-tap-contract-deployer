import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import {
  SIWE_NONCE_COOKIE,
  SIWE_SESSION_COOKIE,
  buildSessionCookieValue,
  createSiweSession,
  requireSiweSecret,
} from '@/lib/siwe';

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();
    if (!message || !signature) {
      return NextResponse.json({ error: 'Missing message or signature' }, { status: 400 });
    }

    const nonce = request.cookies.get(SIWE_NONCE_COOKIE)?.value;
    if (!nonce) {
      return NextResponse.json({ error: 'Missing nonce' }, { status: 400 });
    }

    const domain = request.headers.get('host') || new URL(request.url).host;
    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({ signature, domain, nonce });
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const issuedAt = siweMessage.issuedAt || new Date().toISOString();
    const session = createSiweSession(siweMessage.address, siweMessage.chainId, issuedAt);
    const secret = requireSiweSecret();
    const response = NextResponse.json({
      ok: true,
      address: session.address,
      chainId: session.chainId,
      expirationTime: session.expirationTime,
    });

    response.cookies.set(SIWE_SESSION_COOKIE, buildSessionCookieValue(session, secret), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete(SIWE_NONCE_COOKIE);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'SIWE verification failed' }, { status: 500 });
  }
}
