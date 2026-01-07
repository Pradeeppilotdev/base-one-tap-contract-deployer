import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// GET - Fetch user referral information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    
    if (!fid) {
      return NextResponse.json(
        { error: 'FID required' },
        { status: 400 }
      );
    }

    try {
      const referralDocRef = doc(db, 'referrals', String(fid));
      const referralDocSnap = await getDoc(referralDocRef);
      
      if (!referralDocSnap.exists()) {
        // Return default values if referral document doesn't exist
        return NextResponse.json({
          referralCode: `ref-${fid}`,
          referralCount: 0,
          totalPoints: 0,
          referredUsers: [],
          hasDeployedContract: false
        });
      }
      
      const referralData = referralDocSnap.data();
      
      return NextResponse.json({
        referralCode: `ref-${fid}`,
        referralCount: referralData.referralCount || 0,
        totalPoints: referralData.totalPoints || 0,
        referredUsers: referralData.referredUsers || [],
        hasDeployedContract: referralData.hasDeployedContract || false,
        username: referralData.username || '',
        displayName: referralData.displayName || '',
        pfpUrl: referralData.pfpUrl || ''
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
    console.error('Error fetching referral info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch referral info' },
      { status: 500 }
    );
  }
}









