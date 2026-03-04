import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

/**
 * Farcaster Mini App Webhook Handler
 * 
 * Receives signed events from Farcaster clients when users:
 *   - Add the mini app (miniapp_added) → stores notification token
 *   - Remove the mini app (miniapp_removed) → deletes notification token
 *   - Enable notifications (notifications_enabled) → stores/updates token
 *   - Disable notifications (notifications_disabled) → deletes token
 *
 * Events arrive as JSON Farcaster Signatures: { header, payload, signature }
 * The payload is base64url-encoded JSON containing the event data.
 *
 * Tokens are stored in Firestore collection "notificationTokens" keyed by
 * a composite of fid + a hash, so we can later query all tokens to send
 * notifications server-side.
 */

function decodeBase64Url(str: string): string {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with = if needed
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Farcaster webhook events come as JFS: { header, payload, signature }
    if (!body.header || !body.payload || !body.signature) {
      console.warn('Webhook: missing JFS fields, raw body:', JSON.stringify(body).slice(0, 200));
      return NextResponse.json({ success: true });
    }

    // Decode the header to get the FID
    let headerData: { fid?: number; type?: string; key?: string };
    try {
      headerData = JSON.parse(decodeBase64Url(body.header));
    } catch {
      console.error('Webhook: failed to decode header');
      return NextResponse.json({ success: true });
    }

    const fid = headerData.fid;
    if (!fid) {
      console.error('Webhook: no FID in header');
      return NextResponse.json({ success: true });
    }

    // Decode the payload to get the event
    let payloadData: {
      event?: string;
      notificationDetails?: { url: string; token: string };
    };
    try {
      payloadData = JSON.parse(decodeBase64Url(body.payload));
    } catch {
      console.error('Webhook: failed to decode payload');
      return NextResponse.json({ success: true });
    }

    const event = payloadData.event;
    console.log(`Webhook event: ${event} for FID ${fid}`);

    const tokenDocRef = doc(db, 'notificationTokens', String(fid));

    switch (event) {
      case 'miniapp_added':
      case 'notifications_enabled': {
        const nd = payloadData.notificationDetails;
        if (nd?.url && nd?.token) {
          await setDoc(tokenDocRef, {
            fid,
            notificationUrl: nd.url,
            token: nd.token,
            event,
            updatedAt: Date.now(),
          });
          console.log(`Stored notification token for FID ${fid}`);
        } else {
          console.log(`${event} for FID ${fid} but no notificationDetails`);
        }
        break;
      }

      case 'miniapp_removed':
      case 'notifications_disabled': {
        try {
          await deleteDoc(tokenDocRef);
          console.log(`Removed notification token for FID ${fid}`);
        } catch (e) {
          console.warn(`Failed to remove token for FID ${fid}:`, e);
        }
        break;
      }

      default:
        console.log(`Webhook: unknown event "${event}" for FID ${fid}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent retries for malformed data
    return NextResponse.json({ success: true });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is active' });
}


