# LCP Optimization Strategy for TMDB Images

## Current Issues (from PageSpeed Insights)
- **LCP: 10.1s** (Poor - Red Zone)
- **Image Size: 1.3MB** needs optimization
- **Bela Shende image**: 887KB → can save 767KB
- Images are larger than displayed dimensions

## Optimization Strategies

### 1. ✅ Use Smaller TMDB Image Sizes
TMDB provides multiple image sizes. Use the smallest size that looks good:
- **w92** - 92px wide (thumbnails)
- **w154** - 154px wide (small cards)
- **w185** - 185px wide (mobile cards)
- **w342** - 342px wide (desktop cards)
- **w500** - 500px wide (large displays)
- **w780** - 780px wide (hero images)

### 2. ✅ Implement Next.js Image Optimization
- Use `priority` prop for LCP images
- Use `loading="lazy"` for below-fold images
- Specify exact `width` and `height` to prevent layout shift
- Use `sizes` prop for responsive images

### 3. ✅ Add Blur Placeholders
- Use `placeholder="blur"` with `blurDataURL`
- Improves perceived performance

### 4. ✅ Optimize Image Formats
- Next.js automatically serves WebP/AVIF when supported
- Already configured in next.config.ts

### 5. ✅ Preload LCP Images
- Add `<link rel="preload">` for hero images
- Use `fetchPriority="high"` for critical images

## Implementation Plan

### Phase 1: Update getImageUrl Helper (DONE)
Create responsive image size selection based on use case.

### Phase 2: Update Image Components
- Homepage hero images: Use priority loading
- Artist cards: Use appropriate sizes
- Movie posters: Optimize for display size

### Phase 3: Add Blur Placeholders
- Generate blur data URLs for better UX

### Phase 4: Implement Preloading
- Preload hero/LCP images in layout

## Expected Results
- **LCP**: 10.1s → **2.5s** (Good - Green Zone)
- **Image Size**: 1.3MB → **200-300KB**
- **Performance Score**: 72 → **90+**
