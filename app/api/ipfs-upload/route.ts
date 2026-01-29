import { NextRequest, NextResponse } from 'next/server';

const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl } = await request.json();

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: 'Image data URL is required' },
        { status: 400 }
      );
    }

    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return NextResponse.json(
        { error: 'IPFS configuration missing' },
        { status: 500 }
      );
    }

    // Convert data URL to blob
    const base64Data = imageDataUrl.split(',')[1];
    const binaryData = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    const blob = new Blob([binaryData], { type: 'image/png' });
    formData.append('file', blob, 'resume.png');

    // Upload to Pinata
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: formData,
    });

    if (!pinataResponse.ok) {
      const error = await pinataResponse.text();
      console.error('Pinata upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload to IPFS' },
        { status: 500 }
      );
    }

    const pinataData = (await pinataResponse.json()) as { IpfsHash: string };
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}`;

    return NextResponse.json({
      success: true,
      ipfsUrl,
      ipfsHash: pinataData.IpfsHash,
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
