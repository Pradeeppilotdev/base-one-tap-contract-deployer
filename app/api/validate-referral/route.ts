import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';

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
      let referralDocSnap = await getDoc(referralDocRef);
      
      // If referral document doesn't exist, check if user has deployed contracts
      // If they have, create the referral document
      if (!referralDocSnap.exists()) {
        // Check users collection to see if this FID has deployed contracts
        try {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          let userData: any = null;
          let hasDeployedContract = false;
          
          for (const userDoc of usersSnapshot.docs) {
            const data = userDoc.data();
            if (data.fid === Number(fid) || String(data.fid) === fid) {
              userData = data;
              const contracts = data.contracts || [];
              if (contracts.length > 0) {
                hasDeployedContract = true;
                break;
              }
            }
          }
          
          // If user has deployed contracts, create the referral document
          if (hasDeployedContract && userData) {
            await setDoc(referralDocRef, {
              fid: fid,
              username: userData.username || '',
              displayName: userData.displayName || '',
              pfpUrl: userData.pfpUrl || '',
              hasDeployedContract: true,
              referralCount: 0,
              totalPoints: 0,
              monthlyReferrals: {},
              referredUsers: [],
              lastUpdated: Date.now()
            }, { merge: true });
            
            // Re-fetch the document
            referralDocSnap = await getDoc(referralDocRef);
          } else {
            // User hasn't deployed contracts yet
            return NextResponse.json(
              { 
                valid: false,
                error: 'This referral code does not exist or the user has not used the app yet'
              },
              { status: 200 }
            );
          }
        } catch (checkError: any) {
          // If we can't check users collection, return error
          console.error('Error checking users collection:', checkError);
          return NextResponse.json(
            { 
              valid: false,
              error: 'Unable to verify referral code. Please try again.'
            },
            { status: 500 }
          );
        }
      }

      // Ensure the document exists after potential creation
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
      // First, check if referralData has a flag indicating contracts were deployed
      // This is more efficient than querying all users
      if (referralData.hasDeployedContract === true) {
        // Referral code is valid - user has deployed contracts
        return NextResponse.json({
          valid: true,
          fid: fid,
          username: referralData.username || '',
          displayName: referralData.displayName || '',
          pfpUrl: referralData.pfpUrl || '',
          referralCount: referralData.referralCount || 0
        });
      }
      
      // Fallback: Check the users collection for any user with this FID
      // This is less efficient but necessary if the flag isn't set
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        let hasDeployedContract = false;
        
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          if (userData.fid === Number(fid) || String(userData.fid) === fid) {
            const contracts = userData.contracts || [];
            if (contracts.length > 0) {
              hasDeployedContract = true;
              // Update the referral document with the flag for future queries
              try {
                await updateDoc(referralDocRef, { hasDeployedContract: true });
              } catch (updateError) {
                // Ignore update errors - it's just an optimization
                console.warn('Failed to update referral flag:', updateError);
              }
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
      } catch (usersQueryError: any) {
        // If querying users fails, we cannot verify that the referrer has deployed contracts
        // This is a security requirement - we must verify before marking as valid
        console.error('Users query failed, cannot verify referral:', usersQueryError);
        
        // Provide specific error messages based on error type
        let errorMessage = 'Unable to verify referral code. Please try again.';
        if (usersQueryError.code === 'permission-denied') {
          errorMessage = 'Database permission error. Please contact support.';
        } else if (usersQueryError.code === 'unavailable') {
          errorMessage = 'Database temporarily unavailable. Please try again in a moment.';
        } else if (usersQueryError.message) {
          errorMessage = `Unable to verify referral: ${usersQueryError.message}`;
        }
        
        // Return valid: false - we cannot verify without querying users collection
        return NextResponse.json(
          { 
            valid: false,
            error: errorMessage
          },
          { status: 500 }
        );
      }
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError);
      
      // Provide more specific error messages
      let errorMessage = 'Database error. Please try again.';
      if (firestoreError.code === 'permission-denied') {
        errorMessage = 'Database permission error. Please contact support.';
      } else if (firestoreError.code === 'unavailable') {
        errorMessage = 'Database temporarily unavailable. Please try again in a moment.';
      } else if (firestoreError.message) {
        errorMessage = `Database error: ${firestoreError.message}`;
      }
      
      return NextResponse.json(
        { 
          valid: false,
          error: errorMessage
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











