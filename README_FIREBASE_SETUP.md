# Firebase Firestore Setup Guide

This guide explains how Firebase Firestore is configured for the Base Contract Deployer app.

## What is Firebase Firestore?

Firebase Firestore is a NoSQL document database that provides real-time data synchronization and offline support. It's perfect for storing user data like contracts and achievements.

## Environment Variables Setup

The app uses environment variables for Firebase configuration. You need to add these to Vercel:

### 1. Get Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `base-contract-deployer`
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Click on your web app (or create one if needed)
6. Copy the config values

### 2. Add Environment Variables to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `base-one-tap-contract-deployer`
3. Go to **Settings** → **Environment Variables**
4. Add these variables (all with `NEXT_PUBLIC_` prefix):

```

```

5. Make sure to set them for **Production**, **Preview**, and **Development** environments
6. Click **Save**


### 3. (Optional) Enable Analytics

Analytics is already initialized in the config. To view analytics:

1. Go to **Analytics** in Firebase Console
2. Enable Google Analytics if prompted
3. View user events and engagement

## Data Structure

### Collection: `users`

Each document represents a user (identified by wallet address):

**Document ID**: `{walletAddress}` (lowercase, e.g., `0x96c7ab8b4d8d647df5f1e2b84f9bf80f842f1f43`)

**Document Data**:
```json
{
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
  "achievements": [
    {
      "id": "first",
      "name": "First Deploy",
      "description": "Deploy your first contract",
      "milestone": 1,
      "unlocked": true,
      "unlockedAt": 1701234567890
    }
  ],
  "lastUpdated": 1701234567890
}
```

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

## Viewing Data in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click on the `users` collection
5. View documents by wallet address

## Pricing

Firebase Firestore has a **generous free tier**:
- 1 GB storage
- 50K reads/day
- 20K writes/day
- 20K deletes/day

Perfect for small to medium apps. Paid plans scale automatically.

## Security Best Practices

1. **Set up proper security rules** (see above)
2. **Consider adding authentication** if you want to restrict writes
3. **Validate data** on the server side (already done in API route)
4. **Monitor usage** in Firebase Console

## Troubleshooting

### Error: "Missing or insufficient permissions"

- Check your Firestore security rules
- Make sure rules allow read/write operations
- Verify the collection name is `users`

### Error: "Firestore not initialized"

- Check that `lib/firebase.ts` is properly configured
- Verify Firebase config is correct
- Make sure Firestore is enabled in Firebase Console

### Data not appearing

- Check Firebase Console → Firestore Database
- Verify the document ID matches the wallet address (lowercase)
- Check browser console for errors

## Migration Notes

- Data is stored in Firestore collection `users`
- Each wallet address is a document ID
- Data persists across deployments
- Configuration is stored in environment variables (secure)

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

