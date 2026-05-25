import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const runtime = 'nodejs';

/**
 * Client-side fallback to persist notification tokens to Firebase.
 * 
 * The primary source of tokens is the webhook (/api/webhook) which receives
 * events directly from the Farcaster client. However, tokens are also available
 * via sdk.context.client.notificationDetails on the client side, so we save
 * them here as a belt-and-suspenders approach.
 */
export async function POST(request: NextRequest) {
  let body: { fid?: number | string; notificationUrl?: string; token?: string };
  try {
    body = await request.json();
  } catch (err) {
    console.warn('Save notification token: invalid JSON body', err);
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const rawFid = typeof body.fid === 'string' ? body.fid.trim() : body.fid;
  const parsedFid = Number(rawFid);
  const notificationUrl = typeof body.notificationUrl === 'string' ? body.notificationUrl.trim() : '';
  const token = typeof body.token === 'string' ? body.token.trim() : '';

  if (!Number.isFinite(parsedFid) || parsedFid <= 0 || !notificationUrl || !token) {
    console.warn('Save notification token: missing or invalid fields', {
      fid: body.fid,
      notificationUrl: body.notificationUrl,
      token: body.token ? '[redacted]' : undefined,
    });
    return NextResponse.json(
      { error: 'Missing or invalid fields: fid, notificationUrl, token' },
      { status: 400 }
    );
  }

  const tokenDocRef = doc(db, 'notificationTokens', String(parsedFid));
  try {
    await setDoc(tokenDocRef, {
      fid: parsedFid,
      notificationUrl,
      token,
      source: 'client-context', // distinguish from webhook-sourced tokens
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err: any) {
    const code = err?.code;
    const status = code === 'permission-denied' ? 403 : code === 'unavailable' ? 503 : 500;
    console.error('Save notification token error:', err);
    return NextResponse.json(
      { error: 'Failed to save token', details: err?.message || 'Unknown error', code },
      { status }
    );
  }

  return NextResponse.json({ success: true });
}
