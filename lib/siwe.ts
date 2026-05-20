import { createHmac } from 'crypto';
import type { NextRequest } from 'next/server';

export const SIWE_NONCE_COOKIE = 'siwe-nonce';
export const SIWE_SESSION_COOKIE = 'siwe-session';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export interface SiweSession {
  address: string;
  chainId: number;
  issuedAt: string;
  expirationTime: string;
}

const getSessionSecret = () => process.env.SIWE_SESSION_SECRET;

const signValue = (value: string, secret: string) =>
  createHmac('sha256', secret).update(value).digest('base64url');

export const buildSessionCookieValue = (session: SiweSession, secret: string) => {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = signValue(payload, secret);
  return `${payload}.${signature}`;
};

export const parseSessionCookieValue = (value: string, secret: string): SiweSession | null => {
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = signValue(payload, secret);
  if (signature !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SiweSession;
    if (!data.address || !data.expirationTime) return null;
    if (Date.parse(data.expirationTime) <= Date.now()) return null;
    return data;
  } catch {
    return null;
  }
};

export const getSiweSession = (request: NextRequest): SiweSession | null => {
  const secret = getSessionSecret();
  if (!secret) return null;
  const cookie = request.cookies.get(SIWE_SESSION_COOKIE)?.value;
  if (!cookie) return null;
  return parseSessionCookieValue(cookie, secret);
};

export const createSiweSession = (address: string, chainId: number, issuedAt: string): SiweSession => ({
  address,
  chainId,
  issuedAt,
  expirationTime: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
});

export const requireSiweSecret = () => {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('SIWE_SESSION_SECRET is not set');
  }
  return secret;
};
