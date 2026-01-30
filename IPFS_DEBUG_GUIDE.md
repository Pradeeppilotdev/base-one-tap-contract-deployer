# IPFS Share Feature - Debugging Guide

## What Was Fixed

The share buttons were clicking but nothing happened because the `resume-capture` element didn't exist on the main dashboard. The element was only present on the `/resume` page.

**Solution:** Added a hidden resume card to the main `ContractDeployer.tsx` component that can be captured when the share buttons are clicked.

## How to Test the Share Feature

### Step 1: Open Browser DevTools
1. Open your app in browser
2. Press `F12` or right-click → "Inspect"
3. Go to the **Console** tab and the **Network** tab (keep both visible)

### Step 2: Clear Console
Clear the console to start fresh:
- Type `console.clear()` in console or click the clear button

### Step 3: Deploy at Least One Contract
- Make sure you've deployed at least 1 contract on the app
- This ensures you have data to share in the resume

### Step 4: Click "Share on X" Button
1. Look at the main dashboard
2. Find the "Share on X" button (blue button with Twitter icon)
3. **Watch the Console tab** as you click it
4. You should see logs like:
   ```
   Starting Twitter share...
   Resume data stored: {...}
   Capturing resume image...
   Image captured, uploading to IPFS...
   [IPFS-UPLOAD] Starting image upload...
   [IPFS-UPLOAD] Received image data URL: ...
   ```

### Step 5: Check Network Tab
1. Switch to **Network tab**
2. Look for a request to `/api/ipfs-upload`
3. Click on it to see:
   - **Status:** Should be 200
   - **Response:** Should contain `ipfsUrl` and `ipfsHash`

## Expected Behavior

When everything works:
1. You click "Share on X" button
2. Button shows "Uploading..." with spinner for ~2-5 seconds
3. Console shows upload progress logs
4. Twitter compose window opens with:
   - Your resume metrics text
   - A link to `/resume` page with IPFS image URL in query params
   - The image itself displayed in the preview
5. Button returns to normal state
6. Success message appears: "Resume shared on X successfully!"

## Troubleshooting

### Issue: Nothing happens when clicking button

**Check 1: Is the button disabled?**
- If button text says "Uploading...", the async function started but may be stuck
- Check the Network tab to see if `/api/ipfs-upload` is being called

**Check 2: Console errors?**
- Look for red error messages in console
- Common errors:
  - "Resume card element not found" → Resume-capture div wasn't found
  - "Failed to upload image: ..." → IPFS endpoint returned error
  - "Wallet not connected" → Need to connect wallet first

**Check 3: Network request to `/api/ipfs-upload`**
- Open Network tab → Click "Share on X"
- Look for `/api/ipfs-upload` request
- If not there, the fetch isn't being made at all
- If there, check the response status and body

### Issue: Console shows upload logs but Twitter doesn't open

**Likely cause:** IPFS endpoint is failing
- Check the response of `/api/ipfs-upload` in Network tab
- It should return: `{ success: true, ipfsUrl: "https://gateway.pinata.cloud/ipfs/..." }`
- If it returns an error, check:
  - Are `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` set in `.env`?
  - Are they valid credentials?
  - Is Pinata API accessible?

**Test the endpoint directly:**
1. Go to `http://localhost:3000/api/ipfs-upload-test`
2. You should see a JSON response showing if Pinata is configured
3. If it says keys are missing, add them to `.env` and restart the dev server

### Issue: html2canvas is not capturing the resume card

**Check 1: Is the resume-capture div visible?**
- Open DevTools → Elements tab
- Search for `id="resume-capture"`
- It should exist (will be hidden with `display: hidden`)
- If not found, check if ContractDeployer.tsx was properly updated

**Check 2: Is html2canvas imported?**
- In `components/ContractDeployer.tsx`, line 4 should have:
  ```tsx
  import html2canvas from 'html2canvas';
  ```

### Issue: IPFS URL is very long in Twitter

This is normal! The URL includes all resume metrics as query parameters so the `/resume` page can display the data without server calls.

Example:
```
/resume?address=0x...&contracts=5&transactions=12&gas=0.05&days=3&strength=MEDIUM&displayName=User&image=https://gateway.pinata.cloud/ipfs/QmXXX
```

## Environment Variables Required

Make sure these are in your `.env` file:

```env
PINATA_API_KEY=your_key_here
PINATA_SECRET_API_KEY=your_secret_here
```

To get these:
1. Go to pinata.cloud
2. Sign in or create account
3. Go to API Keys section
4. Create or use existing API key
5. Copy both the key and secret

## Files Modified

- `components/ContractDeployer.tsx` - Added hidden resume-capture div
- `app/api/ipfs-upload/route.ts` - Added comprehensive error logging
- `app/api/ipfs-upload-test/route.ts` - New endpoint to test Pinata credentials

## Next Steps if Still Not Working

1. Check browser console for errors
2. Test `/api/ipfs-upload-test` endpoint
3. Verify Pinata credentials are valid
4. Check Network tab to see what requests are being made
5. Look at server logs (if running locally with `npm run dev`)

## Console Log Guide

When share button is clicked, you'll see these logs in order:

1. `Starting Twitter share...` - Function started
2. `Resume data stored: {...}` - Data saved locally
3. `Capturing resume image...` - html2canvas starting
4. `Image captured, uploading to IPFS...` - Canvas ready, sending to API
5. `[IPFS-UPLOAD] Starting image upload...` - Server received request
6. `[IPFS-UPLOAD] Checking Pinata credentials...` - Validating keys
7. `[IPFS-UPLOAD] Converting base64 to binary...` - Processing image
8. `[IPFS-UPLOAD] Uploading to Pinata...` - Sending to IPFS
9. `[IPFS-UPLOAD] Upload successful!` - Success!
10. `Image uploaded to IPFS: https://gateway.pinata.cloud/ipfs/...` - Got URL back
11. `Opening Twitter with URL: https://twitter.com/intent/tweet?...` - Opening share window

If logs stop at any point, that's where the issue is.
