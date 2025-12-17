# Content Security Policy (CSP) Implementation

## Overview
This document describes the secure Content Security Policy implementation for TamilRing.

## Changes Made

### 1. Middleware CSP Configuration (`middleware.ts`)
The CSP has been updated to remove unsafe directives while maintaining functionality:

**Removed:**
- `'unsafe-inline'` from `script-src` (XSS vulnerability)
- `'unsafe-eval'` from `script-src` (code injection risk)
- `blob:` from `script-src` (overly broad)
- `data:` from `media-src` and `font-src` (potential exploit vector)
- Overly broad `https:` wildcards

**Added:**
- `'nonce-${nonce}'` for inline scripts (secure alternative to unsafe-inline)
- `'strict-dynamic'` for Next.js dynamic script loading
- Specific trusted domains only
- WebSocket support for Supabase (`wss://*.supabase.co`)

**Current CSP Policy:**
```
default-src 'self';
script-src 'self' 'nonce-{random}' 'strict-dynamic' https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://apis.google.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com https://*.supabase.co https://*.supabase.in;
media-src 'self' blob: https://*.supabase.co https://*.supabase.in;
connect-src 'self' https://unpkg.com https://www.google-analytics.com https://www.googletagmanager.com https://*.supabase.co https://*.supabase.in wss://*.supabase.co;
font-src 'self' https://fonts.gstatic.com;
frame-src 'self' https://accounts.google.com;
object-src 'none';
base-uri 'self';
form-action 'self';
worker-src 'self' blob:;
frame-ancestors 'none';
upgrade-insecure-requests;
```

### 2. Root Layout Updates (`app/layout.tsx`)
- Made `RootLayout` an async function to access headers
- Retrieves nonce from request headers
- Applies nonce to Google Analytics script
- Applies nonce to JSON-LD structured data script

### 3. JsonLdScript Component (`components/JsonLdScript.tsx`)
Created a reusable component for JSON-LD structured data that:
- Automatically retrieves the nonce from headers
- Applies it to the script tag
- Ensures CSP compliance for all SEO markup

## Usage

### For Inline Scripts
When you need to add inline scripts, use Next.js `<Script>` component with nonce:

```tsx
import { headers } from 'next/headers';
import Script from 'next/script';

export default async function MyPage() {
  const nonce = (await headers()).get('x-nonce') || undefined;
  
  return (
    <Script id="my-script" nonce={nonce}>
      {`console.log('This is secure!');`}
    </Script>
  );
}
```

### For JSON-LD Structured Data
Use the `JsonLdScript` component:

```tsx
import { JsonLdScript } from '@/components/JsonLdScript';

export default async function MyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'My Page'
  };
  
  return (
    <div>
      <JsonLdScript data={jsonLd} />
      {/* rest of your page */}
    </div>
  );
}
```

## Remaining Tasks

### Pages with JSON-LD - All Updated! ✅
1. ✅ `app/page.tsx` - Updated
2. ✅ `app/ringtone/[slug]/page.tsx` - Updated
3. ✅ `app/tamil/movies/[movie_name]/page.tsx` - Updated
4. ✅ `app/tamil/actors/[actor_name]/page.tsx` - Updated
5. ✅ `app/tamil/music-directors/[artist_name]/page.tsx` - Updated
6. ✅ `app/layout.tsx` - Updated (root layout with Google Analytics)

All pages now use the `JsonLdScript` component for secure CSP-compliant structured data.

## Why These Changes Matter

### Security Benefits:
1. **Prevents XSS attacks**: No inline scripts can execute without the correct nonce
2. **Blocks code injection**: `unsafe-eval` removed prevents eval() exploitation
3. **Restricts sources**: Only trusted domains can load resources
4. **Prevents clickjacking**: `frame-ancestors 'none'` blocks embedding

### Note on `style-src 'unsafe-inline'`
We still allow `'unsafe-inline'` for styles because:
- Tailwind CSS and CSS-in-JS libraries require it
- Style injection is less dangerous than script injection
- Can be removed if you migrate to external stylesheets only

## Testing CSP
To test the CSP is working:
1. Open browser DevTools Console
2. Look for CSP violation warnings
3. Try to inject inline scripts (they should be blocked)
4. Verify all legitimate scripts still work

## Browser Compatibility
This CSP configuration works with:
- Chrome/Edge 76+
- Firefox 58+
- Safari 15.4+

The `'strict-dynamic'` directive is supported by all modern browsers and allows Next.js to dynamically load scripts securely.
