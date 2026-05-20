import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserData {
  contracts: any[];
  achievements: any[];
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  referralPoints?: number;
  clicks?: number;
  lastUpdated: number;
  // Streak tracking
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: string; // Format: YYYY-MM-DD
}

// Get user data document reference
const getUserDataRef = (walletAddress: string) => 
  doc(db, 'users', walletAddress.toLowerCase());

// GET - Fetch user data by wallet address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    try {
      const userDocRef = getUserDataRef(walletAddress);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        // Return empty data if user doesn't exist yet
        return NextResponse.json({
          contracts: [],
          achievements: [],
          lastUpdated: Date.now()
        });
      }
      
      const userData = userDocSnap.data() as UserData;
      return NextResponse.json(userData);
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
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

// POST - Save user data (contracts, achievements, or clicks)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, contracts, achievements, fid, username, displayName, pfpUrl, clicks } = body;
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Allow clicks-only updates (contracts can be undefined)
    if (contracts !== undefined && !Array.isArray(contracts)) {
      return NextResponse.json(
        { error: 'Contracts must be an array' },
        { status: 400 }
      );
    }

    if (achievements !== undefined && !Array.isArray(achievements)) {
      return NextResponse.json(
        { error: 'Achievements must be an array' },
        { status: 400 }
      );
    }

    try {
      const userDocRef = getUserDataRef(walletAddress);
      
      // Read existing data from Firestore
      const userDocSnap = await getDoc(userDocRef);
      let existingContracts: any[] = [];
      let existingAchievements: any[] = [];
      let existingData: UserData | null = null;
      
      if (userDocSnap.exists()) {
        existingData = userDocSnap.data() as UserData;
        existingContracts = existingData.contracts || [];
        existingAchievements = existingData.achievements || [];
      }
      
      // Merge contracts: combine existing and new, remove duplicates by address
      const contractMap = new Map<string, any>();
      
      // Add existing contracts first
      existingContracts.forEach(contract => {
        if (contract.address) {
          contractMap.set(contract.address.toLowerCase(), contract);
        }
      });
      
      // Add/update with new contracts (only if contracts array is provided)
      if (contracts && Array.isArray(contracts)) {
        contracts.forEach((contract: any) => {
          if (contract.address) {
            contractMap.set(contract.address.toLowerCase(), contract);
          }
        });
      }
      
      // Convert back to array
      const mergedContracts = Array.from(contractMap.values());
      
      // Merge achievements: use provided achievements or keep existing
      const mergedAchievements = achievements !== undefined ? achievements : existingAchievements;
      
      // Build userData object, only including fields that have values (Firestore doesn't allow undefined)
      const userData: any = {
        contracts: mergedContracts,
        achievements: mergedAchievements,
        lastUpdated: Date.now()
      };
      
      // Only add optional fields if they have values
      const finalFid = fid !== undefined ? fid : (existingData?.fid);
      if (finalFid !== undefined) {
        userData.fid = finalFid;
      }
      
      const finalUsername = username !== undefined ? username : (existingData?.username);
      if (finalUsername !== undefined && finalUsername !== '') {
        userData.username = finalUsername;
      }
      
      const finalDisplayName = displayName !== undefined ? displayName : (existingData?.displayName);
      if (finalDisplayName !== undefined && finalDisplayName !== '') {
        userData.displayName = finalDisplayName;
      }
      
      const finalPfpUrl = pfpUrl !== undefined ? pfpUrl : (existingData?.pfpUrl);
      if (finalPfpUrl !== undefined && finalPfpUrl !== '') {
        userData.pfpUrl = finalPfpUrl;
      }
      
      // Only include referralPoints if it exists and is a number
      if (existingData?.referralPoints !== undefined && typeof existingData.referralPoints === 'number') {
        userData.referralPoints = existingData.referralPoints;
      }

      // Handle clicks - preserve or update based on whether clicks was explicitly sent
      if (clicks !== undefined && typeof clicks === 'number') {
        // Clicks value was explicitly provided - use it as the new total
        userData.clicks = clicks;
      } else if (existingData?.clicks !== undefined) {
        // Clicks not provided but exists in DB - preserve existing value
        userData.clicks = existingData.clicks;
      }

      // Handle Daily Streak tracking
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const lastActiveDate = existingData?.lastActiveDate;
      let currentStreak = existingData?.currentStreak || 0;
      let longestStreak = existingData?.longestStreak || 0;

      // Calculate streak
      if (lastActiveDate) {
        const lastDate = new Date(lastActiveDate);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Same day - maintain current streak
          // No change needed
        } else if (diffDays === 1) {
          // Consecutive day - increment streak
          currentStreak += 1;
          // Update longest streak if current exceeds it
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
        } else {
          // Missed day(s) - reset streak to 1
          currentStreak = 1;
        }
      } else {
        // First time tracking - start streak at 1
        currentStreak = 1;
        longestStreak = 1;
      }

      // Update streak data
      userData.currentStreak = currentStreak;
      userData.longestStreak = longestStreak;
      userData.lastActiveDate = today;

      // Save to Firestore (merge: true to preserve other fields if any)
      await setDoc(userDocRef, userData, { merge: true });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Data saved successfully',
        contractCount: mergedContracts.length
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
    console.error('Error saving user data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save user data' },
      { status: 500 }
    );
  }
}
