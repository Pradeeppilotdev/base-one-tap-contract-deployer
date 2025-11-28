# Base Mini App Embed Setup

## Issue: "No embed found" in Farcaster/Base App

If you're seeing "no embed found" when trying to open your mini app in the Base/Farcaster app, follow these steps:

## Required Setup Steps

### 1. Deploy to Production (HTTPS)

Base mini apps **must** be deployed to a public HTTPS domain. Localhost and ngrok won't work for production.

- Deploy to Vercel, Netlify, or another hosting service
- Ensure your domain is accessible via HTTPS
- Update `NEXT_PUBLIC_ROOT_URL` in your environment variables

### 2. Configure Account Association

1. Go to [Base Build Account Association Tool](https://www.base.dev/preview?tab=account)
2. Enter your production URL (e.g., `https://your-app.vercel.app`)
3. Click "Submit" and then "Verify"
4. Copy the generated `accountAssociation` object
5. Update `minikit.config.ts` with the credentials:

```typescript
accountAssociation: {
  "header": "your-header-here",
  "payload": "your-payload-here",
  "signature": "your-signature-here"
}
```

### 3. Add Required Images

Base mini apps need several images for embeds. Create and add these to the `public/` folder:

- `icon.png` - 512x512 PNG (app icon)
- `hero.png` - 1200x630 PNG (hero image for embeds)
- `og-image.png` - 1200x630 PNG (Open Graph image)
- `splash.png` - 1200x630 PNG (splash screen)
- `screenshot-portrait.png` - Portrait screenshot of your app

**Quick Fix**: For testing, you can use placeholder images or generate them using:
- [Placeholder.com](https://via.placeholder.com)
- [DummyImage.com](https://dummyimage.com)

Example placeholder URLs (update in `minikit.config.ts`):
```typescript
iconUrl: `https://via.placeholder.com/512/1a1a2e/ffffff?text=Contract+Deployer`,
heroImageUrl: `https://via.placeholder.com/1200x630/1a1a2e/ffffff?text=Base+Contract+Deployer`,
ogImageUrl: `https://via.placeholder.com/1200x630/1a1a2e/ffffff?text=Deploy+Contracts+to+Base`,
```

### 4. Verify Manifest is Accessible

Test that your manifest is accessible:

```bash
curl https://your-app.vercel.app/.well-known/farcaster.json
```

It should return valid JSON with your miniapp configuration.

### 5. Test in Base Preview Tool

1. Go to [base.dev/preview](https://base.dev/preview)
2. Enter your app URL
3. Check the "Metadata" tab for any missing fields
4. Verify the embed shows correctly

### 6. Common Issues

**"No embed found"**
- ✅ Manifest is accessible at `/.well-known/farcaster.json`
- ✅ Account association is configured
- ✅ Images are accessible (check URLs)
- ✅ App is deployed to HTTPS domain

**"Page won't open"**
- ✅ Check browser console for errors
- ✅ Verify CORS headers are set correctly
- ✅ Ensure the app loads without errors
- ✅ Check that `homeUrl` in manifest matches your domain

**"Invalid manifest"**
- ✅ Verify JSON is valid
- ✅ Check all required fields are present
- ✅ Ensure accountAssociation is not empty (for production)

## Testing Checklist

- [ ] App deployed to HTTPS domain
- [ ] `NEXT_PUBLIC_ROOT_URL` set correctly
- [ ] Account association configured
- [ ] All images uploaded and accessible
- [ ] Manifest accessible at `/.well-known/farcaster.json`
- [ ] Metadata tags in HTML head
- [ ] Tested in Base preview tool
- [ ] App opens without errors

## Quick Test

After deploying, test your manifest:

```bash
# Replace with your actual URL
curl https://your-app.vercel.app/.well-known/farcaster.json | jq
```

You should see a valid JSON response with your miniapp configuration.

