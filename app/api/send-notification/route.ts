import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Sends a Farcaster Mini App notification to a user.
 * 
 * Two modes:
 *   1. Direct: caller provides notificationUrl + token (e.g. from client context)
 *   2. By FID: caller provides fid — token is looked up from Firestore
 *
 * The Farcaster notification API expects:
 *   POST <notificationUrl>
 *   { notificationId, title, body, targetUrl, tokens: [token] }
 */
export async function POST(request: NextRequest) {
  try {
    const { notificationUrl, token, fid, title, body, targetUrl, notificationId } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: title, body' },
        { status: 400 }
      );
    }

    let resolvedUrl = notificationUrl;
    let resolvedToken = token;

    // If no direct token provided, look up by FID from Firestore
    if ((!resolvedUrl || !resolvedToken) && fid) {
      const tokenDoc = await getDoc(doc(db, 'notificationTokens', String(fid)));
      if (tokenDoc.exists()) {
        const data = tokenDoc.data();
        resolvedUrl = data.notificationUrl;
        resolvedToken = data.token;
      } else {
        return NextResponse.json(
          { error: `No notification token found for FID ${fid}. User may not have added the app or enabled notifications.` },
          { status: 404 }
        );
      }
    }

    if (!resolvedUrl || !resolvedToken) {
      return NextResponse.json(
        { error: 'Missing notification credentials. Provide (notificationUrl + token) or fid.' },
        { status: 400 }
      );
    }

    // Send the notification to the Farcaster notification service
    const response = await fetch(resolvedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: notificationId || `notif-${Date.now()}`,
        title,
        body,
        targetUrl: targetUrl || 'https://base-one-tap-contract-deployer.vercel.app',
        tokens: [resolvedToken],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Farcaster notification error:', response.status, errorText);
      return NextResponse.json(
        { error: `Notification delivery failed: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('Send notification error:', err);
    return NextResponse.json(
      { error: `Failed to send notification: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
