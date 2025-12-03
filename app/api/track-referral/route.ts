import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// POST - Track referral and give points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrerFid, newUserFid, walletAddress } = body;
    
    if (!referrerFid || !newUserFid || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      // Get referrer's data
      const referrerDocRef = doc(db, 'referrals', referrerFid);
      const referrerDocSnap = await getDoc(referrerDocRef);
      
      let referrerData: any = {
        fid: referrerFid,
        referralCount: 0,
        totalPoints: 0,
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
      
      // Update referrer's stats
      await setDoc(referrerDocRef, {
        ...referrerData,
        referralCount: (referrerData.referralCount || 0) + 1,
        totalPoints: (referrerData.totalPoints || 0) + 10, // 10 points per referral
        referredUsers: updatedReferredUsers,
        lastUpdated: Date.now()
      }, { merge: true });
      
      // Track new user's referral info
      const newUserDocRef = doc(db, 'users', walletAddress.toLowerCase());
      const newUserDocSnap = await getDoc(newUserDocRef);
      
      let newUserData: any = {};
      if (newUserDocSnap.exists()) {
        newUserData = newUserDocSnap.data();
      }
      
      await setDoc(newUserDocRef, {
        ...newUserData,
        referredBy: referrerFid,
        referralPoints: 10, // Points for using referral
        lastUpdated: Date.now()
      }, { merge: true });
      
      return NextResponse.json({
        success: true,
        message: 'Referral tracked successfully',
        referrerPoints: (referrerData.totalPoints || 0) + 10,
        newUserPoints: 10
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

