# TMDB Image Size Optimization - Visual Guide

## Image Size Comparison

### Artist Profile Images (Before vs After)

#### Before Optimization:
```
Size: w500 (500px wide)
File Size: ~150-200 KB per image
Total for 10 artists: ~1.5-2 MB
```

#### After Optimization:
```
Size: w185 (185px wide)
File Size: ~30-40 KB per image
Total for 10 artists: ~300-400 KB
```

**Savings: ~1.2 MB (75% reduction)**

## Size Selection Guide

### When to use each size:

| Size | Width | File Size | Best For | Example |
|------|-------|-----------|----------|---------|
| `w92` | 92px | ~10 KB | Tiny thumbnails | User avatars in comments |
| `w154` | 154px | ~20 KB | Small thumbnails | Mobile list items |
| `w185` | 185px | ~35 KB | **Profile images** | Artist cards, actor profiles |
| `w342` | 342px | ~90 KB | **Standard cards** | Movie posters, ringtone cards |
| `w500` | 500px | ~160 KB | Large displays | Desktop hero images |
| `w780` | 780px | ~280 KB | **Hero sections** | Homepage hero slider |
| `original` | Full | ~500 KB+ | ❌ Avoid | Never use (too large) |

## Real-World Impact

### Homepage Load:
```
Before: 10 artists × 160 KB (w500) = 1,600 KB
After:  10 artists × 35 KB (w185)  = 350 KB
Saved:  1,250 KB (78% reduction)
```

### Artist Page Load:
```
Before: 1 profile (w500) + 20 posters (w342) = 160 KB + 1,800 KB = 1,960 KB
After:  1 profile (w185) + 20 posters (w342) = 35 KB + 1,800 KB = 1,835 KB
Saved:  125 KB (6% reduction)
```

## Visual Quality Comparison

### w185 vs w500 for Profile Images:

**Display Size**: 96px × 96px (typical profile card)

- **w185**: Perfect quality (image is larger than display)
- **w500**: Overkill (wasted bandwidth, no visual improvement)

**Conclusion**: w185 is optimal for profile images up to 185px display size.

### w342 vs w500 for Movie Posters:

**Display Size**: 128px × 192px (mobile card)

- **w342**: Excellent quality
- **w500**: Minimal improvement, 77% larger file

**Conclusion**: w342 is optimal for most poster displays.

## LCP Impact

### Critical Path Analysis:

1. **Homepage Hero Slider** (LCP Element)
   - Already optimized with `priority={true}`
   - Uses appropriate sizes per slide
   - Background blur uses `quality={10}`

2. **Artist Profile Images** (Below Fold)
   - Changed to w185 (lazy loaded)
   - Saves 1.2 MB on initial load
   - **Direct LCP improvement**: Faster page load = faster LCP

3. **Movie Posters** (Below Fold)
   - Using w342 (optimal for cards)
   - Lazy loaded
   - No LCP impact but improves overall performance

## Mobile vs Desktop Strategy

### Mobile (< 768px):
- Hero: w780 (full width)
- Cards: w342 (optimal for mobile cards)
- Profiles: w185 (small displays)

### Desktop (> 768px):
- Hero: w780 (still good for desktop)
- Cards: w342 (cards are still small)
- Profiles: w185 (profiles are still small)

**No need for different sizes** - w185 and w342 work great for both!

## Browser Caching

TMDB images are cached by:
1. **Browser Cache**: 1 year (immutable)
2. **Next.js Image Cache**: Optimized WebP/AVIF
3. **CDN Cache**: If using Cloudflare/Vercel

**Result**: Images load instantly on repeat visits!

## Monitoring

### Check image sizes in DevTools:
1. Open DevTools → Network tab
2. Filter by "Img"
3. Look at "Size" column
4. Verify images are ~30-40 KB for profiles, ~80-100 KB for posters

### Expected Results:
```
✅ Artist images: 30-40 KB each
✅ Movie posters: 80-100 KB each
✅ Hero images: 200-300 KB each
❌ Any image > 500 KB: Investigate!
```
