# 🚀 Pre-Production Checklist: TamilRing

This checklist ensures that the website is optimized for performance, SEO, security, and usability before the final launch.

## ⚡ 1. Performance Optimization (High Priority)

The website speed is the most critical factor for user retention.

- [x] **Database Query Optimization**: 
    - [x] Refactor `getTopArtists` in `app/page.tsx` to use a database view or RPC. Currently, it fetches **all** approved ringtones and processes them in-memory, which will become extremely slow as the database grows.
    - [x] Ensure all frequent queries (by `slug`, `status`, `movie_year`) have corresponding indexes in Supabase.
- [x] **Image Optimization**:
    - [x] Verify that `Image` component from Next.js is used for all images.
    - [x] Use `priority` prop for LCP (Largest Contentful Paint) elements like the Hero Slider.
    - [x] Ensure `sizes` attribute is correctly set for responsive images to prevent loading unnecessarily large files on mobile. (Refer to `docs/IMAGE_SIZE_GUIDE.md`).
- [x] **Bundle Size**:
    - [x] Run `npm run build` and check the bundle analyzer output.
    - [x] Identify and remove large unused libraries or use dynamic imports for heavy components (e.g., `wavesurfer.js`).
- [x] **Caching Strategy**:
    - [x] Ensure `revalidate` values are set appropriately for static pages.
    - [x] Verify `unstable_cache` is working correctly for expensive computations.
- [x] **Middleware Latency**:
    - [x] `middleware.ts` currently calls `await supabase.auth.getUser()` on every request. This adds significant TTFB (Time to First Byte) latency because it waits for a round-trip to Supabase before serving the HTML. 
    - [x] **Recommendation**: Only run auth checks for protected routes (`/admin`, `/settings`, etc.) and let public routes serve immediately.
- [x] **Static Generation vs Dynamic Rendering**:
    - [x] `app/layout.tsx` calls `headers()`, which forces the **entire website** into dynamic rendering. This prevents Next.js from caching pages at the edge/CDN.
    - [x] **Recommendation**: Investigate if the CSP `nonce` is absolutely required for every page. If not, remove `headers()` from the root layout to allow static optimization for generic pages like the homepage and artist pages.

## 🔍 2. SEO & Metatags

- [x] **Meta Tags**: 
    - [x] Unique titles and descriptions for every page (Search, Artist, Ringtone detail).
    - [x] Proper OpenGraph (OG) and Twitter card images.
- [x] **Structured Data**:
    - [x] Verify JSON-LD schemas for `MusicComposition`, `Organization`, and `WebSite` using the [Schema Markup Validator](https://validator.schema.org/).
- [x] **Canonical Tags**:
    - [x] Ensure all pages have canonical URLs to prevent duplicate content issues.
- [x] **Sitemap & Robots.txt**:
    - [x] Ensure a dynamic sitemap is generated and `robots.txt` allows indexing.

## 🔒 3. Security & Stability

- [ ] **Environment Variables**:
    - [ ] Ensure all production keys (Supabase, TMDB, Upstash) are correctly set in the deployment environment (Vercel).
- [x] **Content Security Policy (CSP)**:
    - [x] Test the CSP in production to ensure it doesn't block critical resources while maintaining a strong security posture.
- [x] **Rate Limiting**:
    - [x] Verify Upstash Redis rate limiting is active on critical API endpoints (Upload, Like).
- [ ] **Error Handling**:
    - [ ] Implement a custom Error boundary and a 404 page.
    - [ ] Ensure no sensitive database errors are leaked to the client.

## 📱 4. UX & Accessibility (PWA)

- [ ] **PWA Configuration**:
    - [ ] Verify `manifest.json` is correctly configured with icons and theme colors.
    - [ ] Ensure service worker is registering and handling updates correctly.
- [ ] **Responsive Design**:
    - [ ] Test on various screen sizes (Mobile, Tablet, Desktop).
    - [ ] Ensure "Browse by Mood" and other horizontal scrolls work smoothly on touch devices.
- [ ] **Accessibility**:
    - [ ] Check color contrast ratios.
    - [ ] Ensure all buttons and links have descriptive labels or `aria-label`.

## 🛠️ 5. Deployment & Monitoring

- [ ] **Analytics**:
    - [ ] Verify Google Analytics / Vercel Web Vitals are tracking data correctly.
- [ ] **Error Monitoring**:
    - [ ] Set up Sentry or similar for real-time error tracking.
- [ ] **Domain & SSL**:
    - [ ] Ensure the production domain is correctly mapped and SSL is active.
