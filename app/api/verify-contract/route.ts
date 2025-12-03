import { NextRequest, NextResponse } from 'next/server';

// POST - Verify contract on BaseScan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, contractType, sourceCode, constructorArgs } = body;
    
    if (!contractAddress || !contractType || !sourceCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = process.env.BASESCAN_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'BaseScan API key not configured' },
        { status: 500 }
      );
    }

    // Prepare verification request
    const verificationData = new URLSearchParams();
    verificationData.append('apikey', apiKey);
    verificationData.append('module', 'contract');
    verificationData.append('action', 'verifysourcecode');
    verificationData.append('address', contractAddress);
    verificationData.append('codeformat', 'solidity-single-file');
    verificationData.append('contractname', contractType === 'counter' ? 'Counter' : contractType === 'string' ? 'StringStorage' : 'Calculator');
    verificationData.append('compilerversion', 'v0.8.19+commit.7a6c8c3e');
    verificationData.append('optimizationUsed', '1');
    verificationData.append('runs', '200');
    verificationData.append('sourceCode', sourceCode);
    
    if (constructorArgs) {
      verificationData.append('constructorArguements', constructorArgs);
    }

    // Submit verification to BaseScan
    const response = await fetch('https://api.basescan.org/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verificationData.toString()
    });

    const data = await response.json();

    if (data.status === '1' && data.result) {
      return NextResponse.json({
        success: true,
        message: 'Contract verification submitted successfully',
        guid: data.result
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Verification failed',
          details: data.message || 'Unknown error'
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying contract:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify contract' },
      { status: 500 }
    );
  }
}

