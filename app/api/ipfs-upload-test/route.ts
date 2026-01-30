import { NextRequest, NextResponse } from 'next/server';

const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    console.log('[IPFS-UPLOAD-TEST] Checking Pinata configuration...');
    console.log('[IPFS-UPLOAD-TEST] API Key:', PINATA_API_KEY ? 'Present' : 'Missing');
    console.log('[IPFS-UPLOAD-TEST] Secret Key:', PINATA_SECRET_API_KEY ? 'Present' : 'Missing');

    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return NextResponse.json(
        {
          error: 'IPFS configuration missing',
          hasApiKey: !!PINATA_API_KEY,
          hasSecretKey: !!PINATA_SECRET_API_KEY,
        },
        { status: 500 }
      );
    }

    // Test with a simple ping to Pinata
    const testResponse = await fetch('https://api.pinata.cloud/data/pinList?limit=1', {
      method: 'GET',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    if (!testResponse.ok) {
      const error = await testResponse.text();
      console.error('[IPFS-UPLOAD-TEST] Pinata API error:', error);
      return NextResponse.json(
        {
          error: 'Pinata API authentication failed',
          status: testResponse.status,
          details: error,
        },
        { status: 500 }
      );
    }

    const data = await testResponse.json();
    console.log('[IPFS-UPLOAD-TEST] Pinata connection successful');

    return NextResponse.json({
      success: true,
      message: 'Pinata connection is working',
      hasApiKey: !!PINATA_API_KEY,
      hasSecretKey: !!PINATA_SECRET_API_KEY,
    });
  } catch (error) {
    console.error('[IPFS-UPLOAD-TEST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to test IPFS connection', details: String(error) },
      { status: 500 }
    );
  }
}
