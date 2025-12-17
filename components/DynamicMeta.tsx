'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DynamicMeta() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const fidFromUrl = searchParams.get('fid');
  const usernameFromUrl = searchParams.get('username');
  const displayNameFromUrl = searchParams.get('displayName');
  const pfpUrlFromUrl = searchParams.get('pfpUrl');

  useEffect(() => {
    if (ref && typeof window !== 'undefined') {
      // Extract FID from ref (ref-787837 -> 787837)
      const fid = ref.replace('ref-', '');
      
      // Always use production domain, not deployment-specific URLs
      const appUrl = 'https://base-one-tap-contract-deployer.vercel.app';
      
      // Get referrer info from URL params first (for crawlers), then fallback to localStorage
      // Use searchParams from hook instead of window.location.search for reactivity
      
      // Use URL params if available (for crawlers), otherwise try localStorage
      let finalFid = fidFromUrl || fid;
      let finalUsername = usernameFromUrl;
      let finalDisplayName = displayNameFromUrl;
      let finalPfpUrl = pfpUrlFromUrl;
      
      // Check if parameters are missing (null/undefined) vs explicitly empty strings
      // Empty strings are valid values (parameter was provided but is empty)
      // Only fallback to localStorage if parameters are actually missing (null/undefined)
      const isUsernameMissing = finalUsername === null || finalUsername === undefined;
      const isDisplayNameMissing = finalDisplayName === null || finalDisplayName === undefined;
      const isPfpUrlMissing = finalPfpUrl === null || finalPfpUrl === undefined;
      
      if (isUsernameMissing || isDisplayNameMissing || isPfpUrlMissing) {
        // Fallback to localStorage if URL params are missing (not just empty)
        // Use finalFid for consistency (matches the FID used in OG image URL)
        // Also try fid from ref as fallback in case finalFid doesn't match
        let referrerInfo = localStorage.getItem(`referrer-${finalFid}`);
        if (!referrerInfo && finalFid !== fid) {
          // If finalFid differs from ref FID, try the ref FID as fallback
          referrerInfo = localStorage.getItem(`referrer-${fid}`);
        }
        
        if (referrerInfo) {
          try {
            const info = JSON.parse(referrerInfo);
            // Only use localStorage values if URL param was missing (null/undefined)
            // Don't overwrite explicit empty strings from URL
            finalUsername = isUsernameMissing ? (info.username || '') : finalUsername;
            finalDisplayName = isDisplayNameMissing ? (info.displayName || '') : finalDisplayName;
            finalPfpUrl = isPfpUrlMissing ? (info.pfpUrl || '') : finalPfpUrl;
          } catch (e) {
            console.error('Failed to parse referrer info:', e);
          }
        }
      }
      
      // Build OG image URL with all parameters
      const ogImageUrl = `${appUrl}/opengraph-image?ref=${ref}&fid=${finalFid}&username=${encodeURIComponent(finalUsername || '')}&displayName=${encodeURIComponent(finalDisplayName || '')}&pfpUrl=${encodeURIComponent(finalPfpUrl || '')}`;
      
      // Update OG image meta tag
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', ogImageUrl);
      
      // Update fc:miniapp imageUrl
      let fcMiniapp = document.querySelector('meta[name="fc:miniapp"]');
      if (fcMiniapp) {
        try {
          const content = JSON.parse(fcMiniapp.getAttribute('content') || '{}');
          content.imageUrl = ogImageUrl;
          fcMiniapp.setAttribute('content', JSON.stringify(content));
        } catch (e) {
          console.error('Failed to update fc:miniapp meta:', e);
        }
      }
    }
  }, [ref, fidFromUrl, usernameFromUrl, displayNameFromUrl, pfpUrlFromUrl]);

  return null;
}











