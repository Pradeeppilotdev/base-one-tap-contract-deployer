import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

/**
 * Cron endpoint: re-engagement notifications for users who haven't
 * opened or deployed via the mini app recently.
 *
 * Runs every day. Sends to users who:
 *   - Have a notification token (added the mini app)
 *   - Have not deployed anything in the last 3+ days (or never deployed)
 *
 * This fires REGARDLESS of streak status, so it catches:
 *   - Brand new users who never deployed anything
 *   - Users whose streak broke and haven't come back
 *   - Passive users who added the app but never engaged
 *
 * Protected by CRON_SECRET. Deduplicates via notificationId
 * (one re-engagement notification per user per day).
 */

const APP_URL = 'https://base-one-tap-contract-deployer.vercel.app';

// Days of inactivity before sending a re-engagement notification
const INACTIVE_DAYS_THRESHOLD = 3;

// Don't spam — only send re-engagement once every N days per user
const RE_ENGAGE_COOLDOWN_DAYS = 3;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // 1. Fetch all notification tokens
    const tokensSnapshot = await getDocs(collection(db, 'notificationTokens'));

    if (tokensSnapshot.empty) {
      return NextResponse.json({ message: 'No notification tokens found', sent: 0 });
    }

    // 2. Fetch all users to check last activity
    const usersSnapshot = await getDocs(collection(db, 'users'));

    // Build FID → user data map
    const fidToUserData = new Map<number, {
      currentStreak: number;
      lastActiveDate: string | null;
    }>();

    usersSnapshot.forEach(userDoc => {
      const data = userDoc.data();
      if (data.fid) {
        fidToUserData.set(data.fid, {
          currentStreak: data.currentStreak ?? 0,
          lastActiveDate: data.lastActiveDate ?? null,
        });
      }
    });

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const tokenDoc of tokensSnapshot.docs) {
      const tokenData = tokenDoc.data();
      const { fid, notificationUrl, token } = tokenData;

      if (!fid || !notificationUrl || !token) {
        skipped++;
        continue;
      }

      const userData = fidToUserData.get(fid);

      // Determine how long since last activity
      let hoursSinceActive = Infinity; // never deployed = infinitely inactive
      if (userData?.lastActiveDate) {
        const lastActive = new Date(userData.lastActiveDate);
        hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      }

      const daysSinceActive = hoursSinceActive / 24;

      // Skip users who are still active (deployed within threshold)
      if (daysSinceActive < INACTIVE_DAYS_THRESHOLD) {
        skipped++;
        continue;
      }

      // Skip users whose streak is actively at-risk (handled by check-streaks cron)
      if (userData && userData.currentStreak > 0 && hoursSinceActive >= 24 && hoursSinceActive < 48) {
        skipped++;
        continue;
      }

      // Build the message based on user state
      let title: string;
      let body: string;

      if (!userData || !userData.lastActiveDate) {
        // Never deployed
        title = '🚀 Deploy your first contract!';
        body = 'You\'re one tap away from deploying a real smart contract on Base. No code needed!';
      } else if (userData.currentStreak === 0) {
        // Streak broke, haven't come back
        title = '👋 Miss deploying on Base?';
        body = 'Start a new deploy streak today — it only takes one tap!';
      } else {
        // Has streak but been inactive > threshold (should be rare, safety fallback)
        title = '⚡ Time to deploy!';
        body = `You haven't deployed in ${Math.floor(daysSinceActive)} days. Jump back in and keep building!`;
      }

      // Use a cooldown-aware notificationId so Farcaster deduplicates within the window
      const cooldownWindow = Math.floor(now.getTime() / (RE_ENGAGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000));
      const notificationId = `re-engage-${fid}-${cooldownWindow}`;

      try {
        const response = await fetch(notificationUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationId,
            title,
            body,
            targetUrl: APP_URL,
            tokens: [token],
          }),
        });

        if (response.ok) {
          sent++;
          console.log(`Re-engagement notification sent to FID ${fid} (inactive ${Math.floor(daysSinceActive)}d)`);
        } else {
          const errText = await response.text();
          console.error(`Failed to notify FID ${fid}: ${response.status} ${errText}`);
          errors++;

          // Clean up revoked tokens (410 = token no longer valid)
          if (response.status === 410) {
            try {
              await deleteDoc(doc(db, 'notificationTokens', String(fid)));
              console.log(`Cleaned up revoked token for FID ${fid}`);
            } catch {}
          }
        }
      } catch (err) {
        console.error(`Error sending re-engagement to FID ${fid}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      message: 'Re-engagement check complete',
      sent,
      skipped,
      errors,
      totalTokens: tokensSnapshot.size,
    });
  } catch (error: any) {
    console.error('Cron re-engage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run re-engagement cron' },
      { status: 500 }
    );
  }
}
