import { NextRequest, NextResponse } from 'next/server';

/**
 * Sends a Farcaster Mini App notification to a user.
 * 
 * The Farcaster notification system works by POSTing to the notification URL
 * provided by the client context (context.client.notificationDetails).
 * Each user who has added the app gets a unique { url, token } pair.
 */
export async function POST(request: NextRequest) {
  try {
    const { notificationUrl, token, title, body, targetUrl, notificationId } = await request.json();

    if (!notificationUrl || !token || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: notificationUrl, token, title, body' },
        { status: 400 }
      );
    }

    // Send the notification to the Farcaster notification service
    const response = await fetch(notificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: notificationId || `notif-${Date.now()}`,
        title,
        body,
        targetUrl: targetUrl || 'https://base-one-tap-contract-deployer.vercel.app',
        tokens: [token],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Farcaster notification error:', response.status, errorText);
      return NextResponse.json(
        { error: `Notification delivery failed: ${response.status}` },
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
