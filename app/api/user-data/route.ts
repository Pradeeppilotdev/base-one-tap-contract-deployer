import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Simple file-based storage (can be replaced with a database later)
const DATA_DIR = path.join(process.cwd(), 'data');
const getUserDataPath = (walletAddress: string) => 
  path.join(DATA_DIR, `${walletAddress.toLowerCase()}.json`);

interface UserData {
  contracts: any[];
  achievements: any[];
  lastUpdated: number;
}

// Ensure data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

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

    await ensureDataDir();
    const filePath = getUserDataPath(walletAddress);
    
    if (!existsSync(filePath)) {
      // Return empty data if user doesn't exist yet
      return NextResponse.json({
        contracts: [],
        achievements: [],
        lastUpdated: Date.now()
      });
    }

    const fileContent = await readFile(filePath, 'utf-8');
    const userData: UserData = JSON.parse(fileContent);
    
    return NextResponse.json(userData);
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

    await ensureDataDir();
    const filePath = getUserDataPath(walletAddress);
    
    // Read existing data to merge (if any)
    let existingContracts: any[] = [];
    let existingAchievements: any[] = [];
    if (existsSync(filePath)) {
      try {
        const existingData = JSON.parse(await readFile(filePath, 'utf-8'));
        existingContracts = existingData.contracts || [];
        existingAchievements = existingData.achievements || [];
      } catch (e) {
        // If file is corrupted, start fresh
        console.warn('Failed to read existing data, starting fresh:', e);
      }
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

    await writeFile(filePath, JSON.stringify(userData, null, 2), 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data saved successfully',
      contractCount: mergedContracts.length
    });
  } catch (error: any) {
    console.error('Error saving user data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save user data' },
      { status: 500 }
    );
  }
}

