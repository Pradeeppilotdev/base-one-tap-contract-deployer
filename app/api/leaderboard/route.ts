import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// GET - Fetch leaderboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'contracts'; // 'contracts' or 'referrals'
    const order = searchParams.get('order') || 'desc'; // 'asc' or 'desc'
    const limitCount = parseInt(searchParams.get('limit') || '100');

    try {
      // Get all users with contracts - group by FID (not wallet address)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const fidMap = new Map<string, any>(); // Map FID to aggregated user data
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const fid = userData.fid;
        
        // Only process users with FID (Farcaster users)
        if (!fid) continue;
        
        const fidKey = String(fid);
        const contracts = userData.contracts || [];
        const contractCount = contracts.length;
        const clicks = userData.clicks || 0;
        
        // Initialize or update FID entry
        if (!fidMap.has(fidKey)) {
          fidMap.set(fidKey, {
            fid: fid,
            username: userData.username || '',
            displayName: userData.displayName || '',
            pfpUrl: userData.pfpUrl || '',
            contractCount: 0,
            contracts: [],
            firstDeployedAt: null,
            referralCount: 0,
            referralPoints: 0,
            clicks: 0
          });
        }
        
        const fidEntry = fidMap.get(fidKey);
        
        // Aggregate contracts across all wallets for this FID
        fidEntry.contractCount += contractCount;
        fidEntry.contracts.push(...contracts);
        fidEntry.clicks += clicks;
        
        // Update username/displayName/pfpUrl if not set or if this one is better
        if (!fidEntry.username && userData.username) {
          fidEntry.username = userData.username;
        }
        if (!fidEntry.displayName && userData.displayName) {
          fidEntry.displayName = userData.displayName;
        }
        if (!fidEntry.pfpUrl && userData.pfpUrl) {
          fidEntry.pfpUrl = userData.pfpUrl;
        }
        
        // Track earliest contract deployment
        if (contracts.length > 0) {
          const firstContract = contracts.sort((a: any, b: any) => a.timestamp - b.timestamp)[0];
          if (!fidEntry.firstDeployedAt || firstContract.timestamp < fidEntry.firstDeployedAt) {
            fidEntry.firstDeployedAt = firstContract.timestamp;
          }
        }
      }
      
      // Get referral data for each FID
      const usersData: any[] = [];
      const fidEntries = Array.from(fidMap.entries());
      
      for (const [fidKey, fidEntry] of fidEntries) {
        try {
          const referralDocRef = doc(db, 'referrals', fidKey);
          const referralDocSnap = await getDoc(referralDocRef);
          
          if (referralDocSnap.exists()) {
            const referralData = referralDocSnap.data();
            fidEntry.referralCount = referralData.referralCount || 0;
            fidEntry.referralPoints = referralData.totalPoints || 0;
            
            // Only use referral data for profile info if user data is missing
            // User data from users collection is the source of truth for profile info
            // Referral document is only for referral stats, not profile info
            // This prevents referred users from showing the referrer's profile info
            if (!fidEntry.username && referralData.username) {
              fidEntry.username = referralData.username;
            }
            if (!fidEntry.displayName && referralData.displayName) {
              fidEntry.displayName = referralData.displayName;
            }
            if (!fidEntry.pfpUrl && referralData.pfpUrl) {
              fidEntry.pfpUrl = referralData.pfpUrl;
            }
          }
        } catch (e) {
          // Silently handle permission errors - referral data is optional
          if ((e as any).code !== 'permission-denied') {
            console.error('Error fetching referral data for FID', fidKey, ':', e);
          }
        }
        
        // Determine highest achievement based on contract count
        let highestAchievement = null;
        if (fidEntry.contractCount >= 1000) {
          highestAchievement = { name: 'Legendary Builder', icon: 'Gem', milestone: 1000 };
        } else if (fidEntry.contractCount >= 750) {
          highestAchievement = { name: 'Web3 Visionary', icon: 'Sparkles', milestone: 750 };
        } else if (fidEntry.contractCount >= 500) {
          highestAchievement = { name: 'Blockchain Pioneer', icon: 'Flame', milestone: 500 };
        } else if (fidEntry.contractCount >= 300) {
          highestAchievement = { name: 'Unstoppable Force', icon: 'Rocket', milestone: 300 };
        } else if (fidEntry.contractCount >= 200) {
          highestAchievement = { name: 'Mega Creator', icon: 'Zap', milestone: 200 };
        } else if (fidEntry.contractCount >= 100) {
          highestAchievement = { name: 'Contract Deity', icon: 'Gem', milestone: 100 };
        } else if (fidEntry.contractCount >= 50) {
          highestAchievement = { name: 'Base Builder', icon: 'Rocket', milestone: 50 };
        } else if (fidEntry.contractCount >= 20) {
          highestAchievement = { name: 'Deployment Legend', icon: 'Crown', milestone: 20 };
        } else if (fidEntry.contractCount >= 10) {
          highestAchievement = { name: 'Contract Master', icon: 'Trophy', milestone: 10 };
        } else if (fidEntry.contractCount >= 5) {
          highestAchievement = { name: 'Power User', icon: 'Zap', milestone: 5 };
        } else if (fidEntry.contractCount >= 1) {
          highestAchievement = { name: 'First Deploy', icon: 'Sparkles', milestone: 1 };
        }
        
        // Only include users with at least one contract or referral
        if (fidEntry.contractCount > 0 || fidEntry.referralCount > 0) {
          usersData.push({
            fid: fidEntry.fid,
            username: fidEntry.username || '',
            displayName: fidEntry.displayName || fidEntry.username || `FID ${fidEntry.fid}`,
            pfpUrl: fidEntry.pfpUrl || '',
            contractCount: fidEntry.contractCount,
            referralCount: fidEntry.referralCount,
            referralPoints: fidEntry.referralPoints,
            clicks: fidEntry.clicks,
            firstDeployedAt: fidEntry.firstDeployedAt,
            highestAchievement: highestAchievement
          });
        }
      }
      
      // Sort data
      usersData.sort((a, b) => {
        let aValue: number;
        let bValue: number;
        
        if (sortBy === 'contracts') {
          aValue = a.contractCount;
          bValue = b.contractCount;
        } else if (sortBy === 'clicks') {
          aValue = a.clicks;
          bValue = b.clicks;
        } else if (sortBy === 'firstDeploy') {
          aValue = a.firstDeployedAt || 0;
          bValue = b.firstDeployedAt || 0;
        } else {
          aValue = a.referralCount;
          bValue = b.referralCount;
        }
        
        if (order === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
      
      // Limit results
      const limitedData = usersData.slice(0, limitCount);
      
      return NextResponse.json({
        success: true,
        leaderboard: limitedData,
        total: usersData.length
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
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

