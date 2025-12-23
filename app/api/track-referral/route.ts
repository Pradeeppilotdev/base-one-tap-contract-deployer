import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Get current month key (YYYY-MM format)
const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// POST - Track referral and give points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrerFid, newUserFid, walletAddress, referrerUsername, referrerDisplayName, referrerPfpUrl } = body;
    
    if (!referrerFid || !newUserFid || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if new user has deployed at least one contract (referee must deploy first)
    const userDocRef = doc(db, 'users', walletAddress.toLowerCase());
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists() || !userDocSnap.data()?.contracts || userDocSnap.data()?.contracts.length === 0) {
      return NextResponse.json(
        { error: 'You must deploy at least one contract before referral points can be awarded' },
        { status: 400 }
      );
    }
    
    // Check if referrer exists and has deployed contracts (is registered)
    const referrerDocRef = doc(db, 'referrals', referrerFid);
    const referrerDocSnap = await getDoc(referrerDocRef);
    
    if (!referrerDocSnap.exists()) {
      return NextResponse.json(
        { error: 'Referrer does not exist or has not used the app yet' },
        { status: 400 }
      );
    }
    
    // Check if referrer has deployed at least one contract
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let referrerHasContracts = false;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.fid === Number(referrerFid) || String(userData.fid) === referrerFid) {
        const contracts = userData.contracts || [];
        if (contracts.length > 0) {
          referrerHasContracts = true;
          break;
        }
      }
    }
    
    if (!referrerHasContracts) {
      return NextResponse.json(
        { error: 'Referrer must deploy at least one contract for their referral code to be active' },
        { status: 400 }
      );
    }

    try {
      const currentMonth = getCurrentMonthKey();
      
      // Get referrer's data
      const referrerDocRef = doc(db, 'referrals', referrerFid);
      const referrerDocSnap = await getDoc(referrerDocRef);
      
      let referrerData: any = {
        fid: referrerFid,
        username: referrerUsername || '',
        displayName: referrerDisplayName || '',
        pfpUrl: referrerPfpUrl || '',
        referralCount: 0,
        totalPoints: 0,
        monthlyReferrals: {},
        referredUsers: []
      };
      
      if (referrerDocSnap.exists()) {
        referrerData = referrerDocSnap.data();
      }
      
      // Check if this user was already referred by someone
      if (referrerData.referredUsers && referrerData.referredUsers.includes(newUserFid)) {
        return NextResponse.json(
          { error: 'User already referred' },
          { status: 400 }
        );
      }
      
      // Add new user to referred list
      const updatedReferredUsers = [...(referrerData.referredUsers || []), newUserFid];
      
      // Calculate new referral count
      const newReferralCount = (referrerData.referralCount || 0) + 1;
      
      // Determine points: 10 for normal, 20 for 5th referral
      let pointsToAdd = 10;
      if (newReferralCount === 5) {
        pointsToAdd = 20; // Bonus for 5th referral
      }
      
      // Update monthly referrals
      const monthlyReferrals = referrerData.monthlyReferrals || {};
      if (!monthlyReferrals[currentMonth]) {
        monthlyReferrals[currentMonth] = {
          count: 0,
          points: 0
        };
      }
      monthlyReferrals[currentMonth].count += 1;
      monthlyReferrals[currentMonth].points += pointsToAdd;
      
      // Update referrer's stats
      await setDoc(referrerDocRef, {
        ...referrerData,
        username: referrerUsername || referrerData.username || '',
        displayName: referrerDisplayName || referrerData.displayName || '',
        pfpUrl: referrerPfpUrl || referrerData.pfpUrl || '',
        referralCount: newReferralCount,
        totalPoints: (referrerData.totalPoints || 0) + pointsToAdd,
        monthlyReferrals: monthlyReferrals,
        referredUsers: updatedReferredUsers,
        lastUpdated: Date.now()
      }, { merge: true });
      
      // Track new user's referral info
      let newUserData: any = {};
      if (userDocSnap.exists()) {
        newUserData = userDocSnap.data();
      }
      
      await setDoc(userDocRef, {
        ...newUserData,
        referredBy: referrerFid,
        referralPoints: (newUserData.referralPoints || 0) + 10, // Points for using referral
        lastUpdated: Date.now()
      }, { merge: true });
      
      return NextResponse.json({
        success: true,
        message: 'Referral tracked successfully',
        referrerPoints: (referrerData.totalPoints || 0) + pointsToAdd,
        newUserPoints: (newUserData.referralPoints || 0) + 10,
        pointsAwarded: pointsToAdd,
        isBonus: newReferralCount === 5
      });
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError);
      return NextResponse.json(
        { 
          error: 'Database error',
          details: firestoreError.message 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error tracking referral:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track referral' },
      { status: 500 }
    );
  }
}


