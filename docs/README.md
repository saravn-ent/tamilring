# TamilRing Documentation Index

This directory contains architectural, operational, and performance guidelines for the TamilRing platform.

---

## 📂 Documentation Categories

### 0. 🎯 [Product Vision & Purpose](file:///d:/websites/tamilring/docs/PRODUCT_VISION.md)
- **[PRODUCT_VISION.md](file:///d:/websites/tamilring/docs/PRODUCT_VISION.md)**: Product mission, problem statements, target audience, and core pillars.

---

### 1. 🏗️ [Architecture & Engineering](file:///d:/websites/tamilring/docs/architecture)
- **[ANTIGRAVITY_REPORT.md](file:///d:/websites/tamilring/docs/architecture/ANTIGRAVITY_REPORT.md)**: Core Web Vitals optimization protocol (LCP, INP, CLS, CDN caching, Brotli).
- **[AI_RESEARCH.md](file:///d:/websites/tamilring/docs/architecture/AI_RESEARCH.md)**: In-browser Web Audio AI models and ONNX vocal separation research.
- **[WEB_WORKERS_GUIDE.md](file:///d:/websites/tamilring/docs/architecture/WEB_WORKERS_GUIDE.md)**: Off-thread audio slicing and analysis using Web Workers.
- **[THEME_TEST.md](file:///d:/websites/tamilring/docs/architecture/THEME_TEST.md)**: Dark/Light theme hydration and CSS variable isolation tests.
- **[PRE_PRODUCTION_CHECKLIST.md](file:///d:/websites/tamilring/docs/architecture/PRE_PRODUCTION_CHECKLIST.md)**: Production release gates, environment configs, and pre-flight checks.

---

### 2. ⚡ [Performance & Core Web Vitals](file:///d:/websites/tamilring/docs/performance)
- **[PERFORMANCE_ACTION_PLAN.md](file:///d:/websites/tamilring/docs/performance/PERFORMANCE_ACTION_PLAN.md)**: Lighthouse score targets (90+ mobile) and execution priorities.
- **[PERFORMANCE_FIXES.md](file:///d:/websites/tamilring/docs/performance/PERFORMANCE_FIXES.md)**: Summary of dynamic imports and script loading optimizations.
- **[LCP_OPTIMIZATION_PLAN.md](file:///d:/websites/tamilring/docs/performance/LCP_OPTIMIZATION_PLAN.md)**: Largest Contentful Paint reduction strategy.
- **[LCP_OPTIMIZATION_SUMMARY.md](file:///d:/websites/tamilring/docs/performance/LCP_OPTIMIZATION_SUMMARY.md)**: Verification and metrics before/after LCP enhancements.
- **[TBT_FIX_REPORT.md](file:///d:/websites/tamilring/docs/performance/TBT_FIX_REPORT.md)**: Total Blocking Time mitigation via micro-task yielding (`setTimeout(..., 0)`).
- **[IMAGE_SIZE_GUIDE.md](file:///d:/websites/tamilring/docs/performance/IMAGE_SIZE_GUIDE.md)**: Optimal responsive dimensions for TMDB posters and artist avatars.

---

### 3. 🛡️ [Security & WAF Protection](file:///d:/websites/tamilring/docs/security)
- **[WAF_CONFIGURATION.md](file:///d:/websites/tamilring/docs/security/WAF_CONFIGURATION.md)**: Cloudflare and edge middleware firewall rules.
- **[ANTI_CENSORSHIP_GUIDE.md](file:///d:/websites/tamilring/docs/security/ANTI_CENSORSHIP_GUIDE.md)**: Anti-scraping strategy targeting automated copyright scanners and headless crawlers.
- **[CSP_IMPLEMENTATION.md](file:///d:/websites/tamilring/docs/security/CSP_IMPLEMENTATION.md)**: Content Security Policy headers configuration.
- **[CSP_SUMMARY.md](file:///d:/websites/tamilring/docs/security/CSP_SUMMARY.md)**: Breakdown of allowed domains (Google AdSense, TMDB, Supabase, Clarity).
- **[ADMIN_SECURITY.md](file:///d:/websites/tamilring/docs/security/ADMIN_SECURITY.md)**: Role-based access control (RBAC) and email guard for `/admin` routes.
- **[SECURITY_INJECTION_FIXES.md](file:///d:/websites/tamilring/docs/security/SECURITY_INJECTION_FIXES.md)**: SQL injection defense audit and parameterized query verification.
- **[SECURITY_INJECTION_XSS.md](file:///d:/websites/tamilring/docs/security/SECURITY_INJECTION_XSS.md)**: Cross-Site Scripting (XSS) sanitation in user uploads and requests.

---

### 4. ⚖️ [Legal & Compliance](file:///d:/websites/tamilring/docs/legal)
- **[COPYRIGHT_ACTION_PLAN.md](file:///d:/websites/tamilring/docs/legal/COPYRIGHT_ACTION_PLAN.md)**: Safe harbor procedures, repeat infringer policy, and DMCA response workflows.
- **[LEGAL_COPYRIGHT_RISK.md](file:///d:/websites/tamilring/docs/legal/LEGAL_COPYRIGHT_RISK.md)**: Legal risk analysis and fair use guidance for promotional 30-second ringtone snippets.

---

### 5. 🚀 [Operations & Search Indexing](file:///d:/websites/tamilring/docs/operations)
- **[INDEXING_README.md](file:///d:/websites/tamilring/docs/operations/INDEXING_README.md)**: Setup guide for Google Indexing API and Bing IndexNow automated pings.
- **[INDEXING_COMPLETE.md](file:///d:/websites/tamilring/docs/operations/INDEXING_COMPLETE.md)**: Historical report of URLs submitted to search engines.
- **[ALBUM_ART_FIX.md](file:///d:/websites/tamilring/docs/operations/ALBUM_ART_FIX.md)**: Troubleshooting poster missing states and iTunes fallbacks.
- **[BACKFILL_GUIDE.md](file:///d:/websites/tamilring/docs/operations/BACKFILL_GUIDE.md)**: Database backfilling procedures for cast, lyricists, and movie years.
- **[PRE_PUSH_AUDIT_REPORT.md](file:///d:/websites/tamilring/docs/operations/PRE_PUSH_AUDIT_REPORT.md)**: Standard git audit checklist before deployment.
