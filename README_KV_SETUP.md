# Vercel KV (Redis) Setup Guide

This guide will help you set up Vercel KV for persistent data storage in your Base Contract Deployer app.

## What is Vercel KV?

Vercel KV is a Redis-compatible database service provided by Vercel. It's perfect for storing user data like contracts and achievements.

## Setup Steps

### 1. Create Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `base-one-tap-contract-deployer`
3. Navigate to the **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Choose a name (e.g., `base-deployer-kv`)
7. Select a region (choose closest to your users)
8. Click **Create**

### 2. Get Connection Credentials

After creating the KV database:

1. In the Storage tab, click on your KV database
2. Go to the **.env.local** tab
3. You'll see environment variables like:
   ```
   KV_URL=redis://default:xxxxx@xxxxx.redis.vercel-storage.com:xxxxx
   KV_REST_API_URL=https://xxxxx.redis.vercel-storage.com
   KV_REST_API_TOKEN=xxxxx
   KV_REST_API_READ_ONLY_TOKEN=xxxxx
   ```

### 3. Add Environment Variables to Vercel

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add all the KV environment variables:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (optional, for read-only operations)

### 4. For Local Development

Create a `.env.local` file in your project root:

```bash
KV_URL=redis://default:xxxxx@xxxxx.redis.vercel-storage.com:xxxxx
KV_REST_API_URL=https://xxxxx.redis.vercel-storage.com
KV_REST_API_TOKEN=xxxxx
```

**Important**: 
- Add `.env.local` to `.gitignore` (already done)
- Never commit these credentials to git

### 5. Redeploy Your App

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger a deployment

## Testing

After setup, test the API:

**GET Request:**
```
https://base-one-tap-contract-deployer.vercel.app/api/user-data?wallet=0x96c7aB8b4d8d647DF5f1e2b84f9bf80F842F1f43
```

**POST Request:**
```json
{
  "walletAddress": "0x96c7aB8b4d8d647DF5f1e2b84f9bf80F842F1f43",
  "contracts": [
    {
      "address": "0x66a080d0b421489e422b30f9bf493f088da1bebf",
      "contractType": "counter",
      "contractName": "Simple Counter",
      "txHash": "0x1234...",
      "timestamp": 1701234567890,
      "inputValue": null
    }
  ],
  "achievements": []
}
```

## Pricing

Vercel KV has a **free tier**:
- 256 MB storage
- 30,000 requests/day
- Perfect for small to medium apps

If you need more, paid plans start at $0.20/GB storage and $0.20 per 1M requests.

## Troubleshooting

### Error: "KV not configured"

- Make sure you've added all KV environment variables to Vercel
- Redeploy your app after adding environment variables
- Check that the variables are set for the correct environment (Production, Preview, Development)

### Error: "Connection refused"

- Verify your KV database is active in Vercel Dashboard
- Check that environment variables are correct
- Make sure you're using the right tokens (not read-only token for writes)

### Data not persisting

- KV data persists across deployments (unlike `/tmp`)
- Check Vercel KV dashboard to see if data is being stored
- Verify you're using the correct wallet address (case-insensitive)

## Migration from File System

If you had data in `/tmp`, it's already lost (that's why we're using KV now). Users will need to reconnect their wallets and the app will start fresh with KV storage.

## Support

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Vercel KV API Reference](https://vercel.com/docs/storage/vercel-kv/using-the-kv-sdk)













