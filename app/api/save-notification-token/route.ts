import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Client-side fallback to persist notification tokens to Firebase.
 * 
 * The primary source of tokens is the webhook (/api/webhook) which receives
 * events directly from the Farcaster client. However, tokens are also available
 * via sdk.context.client.notificationDetails on the client side, so we save
 * them here as a belt-and-suspenders approach.
 */
export async function POST(request: NextRequest) {
  try {
    const { fid, notificationUrl, token } = await request.json();

    if (!fid || !notificationUrl || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: fid, notificationUrl, token' },
        { status: 400 }
      );
    }

    const tokenDocRef = doc(db, 'notificationTokens', String(fid));
    await setDoc(tokenDocRef, {
      fid: Number(fid),
      notificationUrl,
      token,
      source: 'client-context', // distinguish from webhook-sourced tokens
      updatedAt: Date.now(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Save notification token error:', err);
    return NextResponse.json(
      { error: `Failed to save token: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
