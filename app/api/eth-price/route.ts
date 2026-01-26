import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

const CMC_API_KEY = process.env.CMC_PRO_API_KEY;
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
const CACHE_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
const ETH_CMC_ID = '1027'; // CoinMarketCap ID for Ethereum

async function fetchEthPriceFromCMC(): Promise<number> {
  try {
    const response = await fetch(
      `${CMC_API_URL}?id=${ETH_CMC_ID}&convert=USD`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY || '',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CMC API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data && data.data[ETH_CMC_ID]) {
      const ethData = data.data[ETH_CMC_ID];
      const usdPrice = ethData.quote.USD.price;
      
      if (!usdPrice || typeof usdPrice !== 'number') {
        throw new Error('Invalid price data from CMC');
      }

      return usdPrice;
    }

    throw new Error('No ETH data in CMC response');
  } catch (error) {
    console.error('Error fetching ETH price from CMC:', error);
    throw error;
  }
}

async function getPriceFromCache(): Promise<{ price: number; timestamp: number } | null> {
  try {
    const priceDoc = await getDoc(doc(db, 'system', 'eth_price'));
    
    if (priceDoc.exists()) {
      const data = priceDoc.data();
      const cachedPrice = data.price;
      const cachedTimestamp = data.timestamp?.toMillis?.() || data.timestamp;
      const now = Date.now();

      // Check if cache is still valid (less than 5 hours old)
      if (now - cachedTimestamp < CACHE_DURATION) {
        return {
          price: cachedPrice,
          timestamp: cachedTimestamp,
        };
      }
    }
  } catch (error) {
    console.error('Error reading price cache:', error);
  }

  return null;
}

async function savePriceToCache(price: number): Promise<void> {
  try {
    await setDoc(doc(db, 'system', 'eth_price'), {
      price: price,
      timestamp: Timestamp.now(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving price to cache:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try to get price from cache first
    const cachedData = await getPriceFromCache();
    
    if (cachedData) {
      return NextResponse.json(
        {
          price: cachedData.price,
          source: 'cache',
          timestamp: cachedData.timestamp,
          nextRefreshAt: cachedData.timestamp + CACHE_DURATION,
        },
        { status: 200 }
      );
    }

    // Cache expired or doesn't exist, fetch from CMC
    const price = await fetchEthPriceFromCMC();
    
    // Save to Firebase for other users
    await savePriceToCache(price);

    return NextResponse.json(
      {
        price: price,
        source: 'coinmarketcap',
        timestamp: Date.now(),
        nextRefreshAt: Date.now() + CACHE_DURATION,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in eth-price endpoint:', error);
    
    // Fallback to cache even if expired
    try {
      const cachedData = await getPriceFromCache();
      if (cachedData) {
        return NextResponse.json(
          {
            price: cachedData.price,
            source: 'cache-fallback',
            timestamp: cachedData.timestamp,
          },
          { status: 200 }
        );
      }
    } catch (fallbackError) {
      console.error('Fallback cache also failed:', fallbackError);
    }

    // Last resort: return default price
    return NextResponse.json(
      {
        price: 2500, // Fallback price
        source: 'fallback',
        error: 'Could not fetch price, using default',
      },
      { status: 200 }
    );
  }
}
