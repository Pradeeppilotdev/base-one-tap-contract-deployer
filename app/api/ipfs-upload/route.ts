import { NextRequest, NextResponse } from 'next/server';

const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    console.log('[IPFS-UPLOAD] Starting image upload...');
    
    const { imageDataUrl } = await request.json();
    console.log('[IPFS-UPLOAD] Received image data URL:', imageDataUrl?.substring(0, 50) + '...');

    if (!imageDataUrl) {
      console.error('[IPFS-UPLOAD] Error: Image data URL is required');
      return NextResponse.json(
        { error: 'Image data URL is required' },
        { status: 400 }
      );
    }

    console.log('[IPFS-UPLOAD] Checking Pinata credentials...');
    console.log('[IPFS-UPLOAD] API Key present:', !!PINATA_API_KEY);
    console.log('[IPFS-UPLOAD] Secret Key present:', !!PINATA_SECRET_API_KEY);

    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      console.error('[IPFS-UPLOAD] Error: IPFS configuration missing');
      console.error('[IPFS-UPLOAD] PINATA_API_KEY:', PINATA_API_KEY ? 'SET' : 'NOT SET');
      console.error('[IPFS-UPLOAD] PINATA_SECRET_API_KEY:', PINATA_SECRET_API_KEY ? 'SET' : 'NOT SET');
      return NextResponse.json(
        { 
          error: 'IPFS configuration missing',
          hasApiKey: !!PINATA_API_KEY,
          hasSecretKey: !!PINATA_SECRET_API_KEY,
        },
        { status: 500 }
      );
    }

    // Convert data URL to blob
    console.log('[IPFS-UPLOAD] Converting base64 to binary...');
    const base64Data = imageDataUrl.split(',')[1];
    const binaryData = Buffer.from(base64Data, 'base64');
    console.log('[IPFS-UPLOAD] Binary data size:', binaryData.length, 'bytes');

    const formData = new FormData();
    const blob = new Blob([binaryData], { type: 'image/png' });
    formData.append('file', blob, 'resume.png');
    console.log('[IPFS-UPLOAD] Blob created:', blob.size, 'bytes');

    // Upload to Pinata
    console.log('[IPFS-UPLOAD] Uploading to Pinata...');
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: formData,
    });

    console.log('[IPFS-UPLOAD] Pinata response status:', pinataResponse.status);

    if (!pinataResponse.ok) {
      const error = await pinataResponse.text();
      console.error('[IPFS-UPLOAD] Pinata upload error:', pinataResponse.status, error);
      return NextResponse.json(
        { 
          error: 'Failed to upload to IPFS',
          status: pinataResponse.status,
          details: error,
        },
        { status: 500 }
      );
    }

    const pinataData = (await pinataResponse.json()) as { IpfsHash: string };
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}`;
    
    console.log('[IPFS-UPLOAD] Upload successful!');
    console.log('[IPFS-UPLOAD] IPFS Hash:', pinataData.IpfsHash);
    console.log('[IPFS-UPLOAD] IPFS URL:', ipfsUrl);

    return NextResponse.json({
      success: true,
      ipfsUrl,
      ipfsHash: pinataData.IpfsHash,
    });
  } catch (error) {
    console.error('[IPFS-UPLOAD] Catch block error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
