# Firebase Firestore Setup Guide

This guide explains how Firebase Firestore is configured for the Base Contract Deployer app.

## What is Firebase Firestore?

Firebase Firestore is a NoSQL document database that provides real-time data synchronization and offline support. It's perfect for storing user data like contracts and achievements.

## Current Configuration

The app is already configured with Firebase. The configuration is stored in `lib/firebase.ts`:

- **Project ID**: `base-contract-deployer`
- **Database**: Firestore
- **Collection**: `users`
- **Document ID**: Wallet address (lowercase)

## Firebase Console Setup

### 1. Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `base-contract-deployer`
3. Navigate to **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in production mode** (or test mode for development)
6. Select a location (choose closest to your users)
7. Click **Enable**

### 2. Set Up Security Rules

Go to **Firestore Database** → **Rules** and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - allow read/write for all (adjust based on your needs)
    match /users/{walletAddress} {
      allow read, write: if true; // Public access for now
      
      // For production, you might want to add authentication:
      // allow read, write: if request.auth != null;
    }
  }
}
```

**For Production**, consider more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{walletAddress} {
      // Allow read for anyone (to view contracts)
      allow read: if true;
      
      // Only allow write if the wallet address matches
      // Note: This requires custom authentication or validation
      allow write: if request.resource.data.contracts is array 
                   && request.resource.data.achievements is array;
    }
  }
}
```

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
- No need for environment variables (config is in code)

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

