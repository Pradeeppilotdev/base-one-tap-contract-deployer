'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DynamicMeta() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (ref && typeof window !== 'undefined') {
      // Extract FID from ref (ref-787837 -> 787837)
      const fid = ref.replace('ref-', '');
      
      // Try to get referrer info from localStorage (set when sharing)
      const referrerInfo = localStorage.getItem(`referrer-${fid}`);
      
      if (referrerInfo) {
        try {
          const info = JSON.parse(referrerInfo);
          const appUrl = window.location.origin;
          const ogImageUrl = `${appUrl}/opengraph-image?ref=${ref}&fid=${fid}&username=${encodeURIComponent(info.username || '')}&displayName=${encodeURIComponent(info.displayName || '')}&pfpUrl=${encodeURIComponent(info.pfpUrl || '')}`;
          
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
        } catch (e) {
          console.error('Failed to update meta tags:', e);
        }
      }
    }
  }, [ref]);

  return null;
}











