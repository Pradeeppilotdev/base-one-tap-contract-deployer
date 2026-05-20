import { NextResponse } from 'next/server';
import { SIWE_NONCE_COOKIE, SIWE_SESSION_COOKIE } from '@/lib/siwe';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SIWE_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  response.cookies.set(SIWE_NONCE_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
