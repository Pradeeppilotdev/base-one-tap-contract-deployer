import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserData {
  contracts: any[];
  achievements: any[];
  lastUpdated: number;
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

// POST - Save user data (contracts and achievements)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, contracts, achievements } = body;
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(contracts)) {
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
      
      if (userDocSnap.exists()) {
        const existingData = userDocSnap.data() as UserData;
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
      
      // Add/update with new contracts
      contracts.forEach(contract => {
        if (contract.address) {
          contractMap.set(contract.address.toLowerCase(), contract);
        }
      });
      
      // Convert back to array
      const mergedContracts = Array.from(contractMap.values());
      
      // Merge achievements: use provided achievements or keep existing
      const mergedAchievements = achievements !== undefined ? achievements : existingAchievements;
      
      const userData: UserData = {
        contracts: mergedContracts,
        achievements: mergedAchievements,
        lastUpdated: Date.now()
      };

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
