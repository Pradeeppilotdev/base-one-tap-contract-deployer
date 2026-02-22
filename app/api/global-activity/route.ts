import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// GET - Fetch recent global activity feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitCount = parseInt(searchParams.get('limit') || '20');

    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      // Collect all recent contracts from all users
      const allActivities: any[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const contracts = userData.contracts || [];
        const clicks = userData.clicks || 0;
        
        // Add each contract deployment as an activity
        contracts.forEach((contract: any) => {
          allActivities.push({
            type: 'deployment',
            fid: userData.fid,
            username: userData.username || 'Anonymous',
            displayName: userData.displayName || userData.username || 'Anonymous',
            pfpUrl: userData.pfpUrl || '',
            contractType: contract.contractType,
            contractName: contract.contractName,
            contractAddress: contract.address,
            txHash: contract.txHash,
            timestamp: contract.timestamp,
            network: 'base', // Could detect from address if needed
          });
        });
        
        // Add click activity (aggregate as one item per user)
        if (clicks > 0) {
          allActivities.push({
            type: 'clicks',
            fid: userData.fid,
            username: userData.username || 'Anonymous',
            displayName: userData.displayName || userData.username || 'Anonymous',
            pfpUrl: userData.pfpUrl || '',
            clickCount: clicks,
            timestamp: Date.now(), // We don't track individual click timestamps, use current time
          });
        }
      }
      
      // Sort by timestamp (most recent first)
      allActivities.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit results
      const recentActivities = allActivities.slice(0, limitCount);
      
      return NextResponse.json({
        success: true,
        activities: recentActivities,
        total: allActivities.length
      });
      
    } catch (dbError: any) {
      console.error('Database query error:', dbError);
      return NextResponse.json({ 
        error: 'Failed to fetch activity data',
        details: dbError.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in global-activity API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
