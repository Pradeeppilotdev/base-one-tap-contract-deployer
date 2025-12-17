import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// GET - Validate referral code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get('code');
    
    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code required' },
        { status: 400 }
      );
    }

    // Extract FID from referral code (ref-787837 -> 787837)
    if (!referralCode.startsWith('ref-')) {
      return NextResponse.json(
        { error: 'Invalid referral code format' },
        { status: 400 }
      );
    }

    const fid = referralCode.replace('ref-', '');
    
    try {
      // Check if referrer exists in referrals collection
      const referralDocRef = doc(db, 'referrals', fid);
      const referralDocSnap = await getDoc(referralDocRef);
      
      if (!referralDocSnap.exists()) {
        return NextResponse.json(
          { 
            valid: false,
            error: 'This referral code does not exist or the user has not used the app yet'
          },
          { status: 200 }
        );
      }

      const referralData = referralDocSnap.data();
      
      // Check if referrer has deployed at least one contract (is registered)
      // We need to check the users collection for any user with this FID
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let hasDeployedContract = false;
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.fid === Number(fid) || String(userData.fid) === fid) {
          const contracts = userData.contracts || [];
          if (contracts.length > 0) {
            hasDeployedContract = true;
            break;
          }
        }
      }
      
      if (!hasDeployedContract) {
        return NextResponse.json(
          { 
            valid: false,
            error: 'This referral code is not active. The referrer must deploy at least one contract to activate their referral code.'
          },
          { status: 200 }
        );
      }

      // Referral code is valid
      return NextResponse.json({
        valid: true,
        fid: fid,
        username: referralData.username || '',
        displayName: referralData.displayName || '',
        pfpUrl: referralData.pfpUrl || '',
        referralCount: referralData.referralCount || 0
      });
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError);
      return NextResponse.json(
        { 
          valid: false,
          error: 'Database error. Please try again.'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error validating referral:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: error.message || 'Failed to validate referral code' 
      },
      { status: 500 }
    );
  }
}











