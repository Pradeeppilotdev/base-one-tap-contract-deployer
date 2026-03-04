import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Cron endpoint: checks all users for at-risk streaks and sends
 * Farcaster push notifications to those who have enabled them.
 *
 * Deploy as a Vercel Cron Job running once per day.
 * Protected by CRON_SECRET to prevent unauthorized access.
 *
 * Flow:
 *  1. Fetch all notification tokens from Firestore (notificationTokens collection)
 *  2. For each FID with a token, find the corresponding user by FID
 *  3. Check if the user's streak is at-risk (24-48 hours since last activity)
 *  4. Send a push notification via the Farcaster notification URL
 */

const APP_URL = 'https://base-one-tap-contract-deployer.vercel.app';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch all notification tokens
    const tokensSnapshot = await getDocs(collection(db, 'notificationTokens'));
    
    if (tokensSnapshot.empty) {
      return NextResponse.json({ 
        message: 'No notification tokens found', 
        sent: 0 
      });
    }

    // 2. Fetch all users to check streaks
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    // Build a map of FID → user data for quick lookup
    const fidToUserData = new Map<number, { 
      walletAddress: string;
      currentStreak: number; 
      lastActiveDate: string;
    }>();
    
    usersSnapshot.forEach(userDoc => {
      const data = userDoc.data();
      if (data.fid && data.lastActiveDate && data.currentStreak) {
        fidToUserData.set(data.fid, {
          walletAddress: userDoc.id,
          currentStreak: data.currentStreak,
          lastActiveDate: data.lastActiveDate,
        });
      }
    });

    let sent = 0;
    let skipped = 0;
    let errors = 0;
    const today = new Date().toISOString().split('T')[0];

    // 3. For each notification token, check if user has at-risk streak
    for (const tokenDoc of tokensSnapshot.docs) {
      const tokenData = tokenDoc.data();
      const fid = tokenData.fid;
      const notificationUrl = tokenData.notificationUrl;
      const token = tokenData.token;

      if (!fid || !notificationUrl || !token) {
        skipped++;
        continue;
      }

      const userData = fidToUserData.get(fid);
      if (!userData || userData.currentStreak === 0) {
        skipped++;
        continue;
      }

      // Check if streak is at-risk (24-48 hours since last activity)
      const lastActive = new Date(userData.lastActiveDate);
      const now = new Date();
      const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

      if (hoursSinceActive < 24 || hoursSinceActive >= 48) {
        // Not at-risk: either active today or already broken
        skipped++;
        continue;
      }

      // Use a stable notificationId for deduplication (one per day per FID)
      const notificationId = `streak-at-risk-${fid}-${today}`;

      try {
        const response = await fetch(notificationUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationId,
            title: '🔥 Your streak is at risk!',
            body: `You have a ${userData.currentStreak}-day deploy streak! Deploy a contract today to keep it alive.`,
            targetUrl: APP_URL,
            tokens: [token],
          }),
        });

        if (response.ok) {
          sent++;
          console.log(`Streak notification sent to FID ${fid} (${userData.currentStreak}-day streak)`);
        } else {
          const errText = await response.text();
          console.error(`Failed to notify FID ${fid}: ${response.status} ${errText}`);
          errors++;

          // If token is invalid (410 Gone or specific error), clean it up
          if (response.status === 410) {
            try {
              const { deleteDoc } = await import('firebase/firestore');
              await deleteDoc(doc(db, 'notificationTokens', String(fid)));
              console.log(`Cleaned up invalid token for FID ${fid}`);
            } catch {}
          }
        }
      } catch (err) {
        console.error(`Error sending notification to FID ${fid}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      message: 'Streak check complete',
      sent,
      skipped,
      errors,
      totalTokens: tokensSnapshot.size,
    });
  } catch (error: any) {
    console.error('Cron check-streaks error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check streaks' },
      { status: 500 }
    );
  }
}
