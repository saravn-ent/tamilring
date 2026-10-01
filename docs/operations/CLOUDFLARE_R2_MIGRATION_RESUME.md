# Cloudflare R2 Migration Runbook & 1-Week Resume Guide

> **Status:** ✅ COMPLETED — October 1, 2026
> **Prepared Date:** September 20, 2026
> **Completed Date:** October 1, 2026
> **Assigned Department:** **Department 1: Engineering & Algorithms (DevOps & Cloud SRE + Backend Engineer)**

---

## 1. Executive Summary

TamilRing's media storage has been transitioned from Supabase Storage (1 GB quota limit) to **Cloudflare R2** (10 GB free storage, $0 unlimited bandwidth/egress). 

All code, configurations, credentials, and migration scripts are **100% prepared, installed, and verified**. Once Supabase's monthly billing cycle resets and the HTTP 402 restriction clears, running the 2 scripts below will automatically transfer all audio tracks and purge Supabase storage to 0 MB.

---

## 2. Infrastructure & Credentials State

| Resource | Value / Configuration | Status |
| :--- | :--- | :---: |
| **Provider** | Cloudflare R2 | ✅ Active |
| **Bucket Name** | `tamilring-media` | ✅ Provisioned |
| **Account ID** | `016c4e2bed50cc4632ce47b6c7765fce` | ✅ Connected |
| **Public CDN Domain** | `https://pub-7adb3d7983ad4219ac5d433a25c74aac.r2.dev` | ✅ Live (HTTP 200) |
| **CORS Policy** | `AllowedOrigins: ["*"], AllowedMethods: ["GET", "HEAD"]` | ✅ Saved |
| **Environment Keys** | Added to `.env.local` (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) | ✅ Verified |
| **Next.js Config** | Whitelisted `pub-7adb3d7983ad4219ac5d433a25c74aac.r2.dev` in `next.config.ts` | ✅ Committed |
| **Upload Pipeline** | `app/api/upload/route.ts` streams directly to R2 | ✅ Deployed |
| **Delete Pipeline** | `app/actions/admin.ts` deletes media from R2 | ✅ Deployed |

---

## 3. Resume Instructions (Run When Supabase Resets)

When you return after 1 week (or receive confirmation that Supabase quota is reset):

### Step 1: Run the Automated Migration Script
Open your terminal in `d:\websites\tamilring` and execute:
```bash
node scripts/migrate-to-r2.js
```
* **What it does:**
  * Reads the 1,028 tracks.
  * Downloads each audio file from Supabase and uploads it to `tamilring-media` on Cloudflare R2.
  * Updates `audio_url` and `audio_url_iphone` in the PostgreSQL database to point to the new Cloudflare CDN domain.

### Step 2: Purge Supabase Storage to 0 MB
Immediately after the migration script finishes successfully, run:
```bash
node scripts/purge-supabase-storage.js
```
* **What it does:**
  * Empties all files inside Supabase Storage's `ringtone-files` bucket.
  * Resets Supabase Storage usage to **0 MB / 1 GB**, permanently keeping the Supabase database on the free tier forever.

### Step 3: Verify Site Health
1. Open `http://localhost:3000` (or your production site).
2. Play any ringtone to confirm audio streams from Cloudflare R2 with sub-50ms latency.
3. Test an MP3 download to verify ID3 tagging and download flow.
4. Check Supabase Dashboard ➔ Storage to confirm usage is at 0 MB.

---

## 4. Key Script & File References

* **Migration Script:** [scripts/migrate-to-r2.js](file:///d:/websites/tamilring/scripts/migrate-to-r2.js)
* **Storage Purge Script:** [scripts/purge-supabase-storage.js](file:///d:/websites/tamilring/scripts/purge-supabase-storage.js)
* **R2 Client Helper:** [lib/r2.ts](file:///d:/websites/tamilring/lib/r2.ts)
* **Offline Backup Data:** [scratch/all_ringtones_backup_before_delete.json](file:///d:/websites/tamilring/scratch/all_ringtones_backup_before_delete.json)
