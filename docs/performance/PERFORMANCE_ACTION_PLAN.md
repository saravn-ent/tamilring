# TamilRing Performance Action Plan

## Current Status (2026-01-26)
- **LCP**: 11.6s ⚠️ (Target: <2.5s)
- **FCP**: 1.1s ✅
- **CLS**: 0 ✅
- **TBT**: 660ms ⚠️

## Critical Path to Fix LCP

### Option 1: Aggressive Caching (Recommended - Fastest Impact)
**Deploy to Vercel/Production FIRST, then test:**
- Vercel's Edge Network will cache TMDB images globally
- Next.js Image Optimization will serve WebP/AVIF automatically
- Expected LCP improvement: **11.6s → 3-4s**

**Action:**
```bash
git add .
git commit -m "perf: optimize image loading and reduce artist counts"
git push origin main
```

Then test on **production URL** (not localhost) using PageSpeed Insights.

---

### Option 2: Lazy Load Artist Rows (If Option 1 isn't enough)
**Move all artist rows below the fold into lazy-loaded components:**

**File: `app/page.tsx`**
```tsx
// Add dynamic import at top
const HomeSingers = dynamic(() => import('@/components/home/HomeTopArtists').then(m => ({ default: m.HomeSingers })), {
  loading: () => <SectionSkeleton type="horizontal" />,
  ssr: false // Client-side only
});

// Repeat for HomeActors, HomeMusicDirectors, HomeMovieDirectors
```

**Expected Impact:** LCP will focus on hero section only → **11.6s → 2s**

---

### Option 3: Static Fallback Images (Nuclear Option)
**If TMDB is too slow, use placeholder avatars:**

**File: `components/ImageWithFallback.tsx`**
```tsx
// Change line 47-53 to show initials IMMEDIATELY
if (error || !src) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${fallbackClassName}`}>
      <span className="font-bold text-2xl opacity-70">{getInitials(alt)}</span>
    </div>
  );
}
```

**Expected Impact:** Instant render → **LCP < 1.5s** (but less visual appeal)

---

## Recommended Sequence

1. **Deploy to production** (Option 1) - Test with real CDN caching
2. **If LCP still > 3s**, implement Option 2 (lazy loading)
3. **If LCP still > 2.5s**, implement Option 3 (static fallbacks)

---

## How to Test Properly

### ❌ DON'T test on localhost
- No CDN caching
- No global edge network
- No image optimization pipeline

### ✅ DO test on production
```bash
# After deploying to Vercel/production:
1. Open https://pagespeed.web.dev/
2. Enter your production URL (e.g., https://tamilring.vercel.app)
3. Run test 2-3 times (first run warms cache)
4. Check LCP metric
```

---

## Expected Timeline

| Action | Time | Expected LCP |
|--------|------|--------------|
| Deploy to production | 5 min | 3-4s |
| Implement lazy loading | 15 min | 2-2.5s |
| Add static fallbacks | 10 min | <1.5s |

---

## Current Optimizations Already Applied ✅

- ✅ Priority loading limited to 4 images
- ✅ Artist counts reduced (42 → 32)
- ✅ TMDB timeout reduced (10s → 3s)
- ✅ Image optimization enabled
- ✅ Hostname wildcards configured
- ✅ Cache headers set (31536000s)

---

## Next Command to Run

```bash
# Commit and deploy
git status
git add .
git commit -m "perf: aggressive LCP optimization - reduce artist counts and priority images"
git push origin main
```

Then test on **production URL** using PageSpeed Insights.
