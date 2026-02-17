# Album Art / Poster Sync Fix

## Problem

Every time ringtones were approved, more would appear with missing album art (`poster_url = null`). This was causing placeholder icons to show up on the website instead of proper movie posters or album artwork.

## Root Cause

The `UploadForm.tsx` component's `getPosterUrl()` function had insufficient fallback logic:

1. **Returned `undefined`** when all fallbacks failed → caused `null` in database
2. **Devotional songs** (Murugan, Siva, etc.) had no TMDB/iTunes matches
3. **Old Tamil movies** not available in TMDB database
4. **Generic movie names** (F1, Other, Bomb) were being processed but had no valid sources

## Solution Implemented

### 1. **Comprehensive Poster Fix Script** (`scripts/comprehensive_poster_fix.js`)

A one-time script that:
- ✅ Fetches posters from **TMDB** for movies
- ✅ Fetches artwork from **iTunes** for albums/songs
- ✅ Uses **deity-specific images** for devotional content (Murugan, Siva, Ganesha, etc.)
- ✅ Applies **category-based placeholders** as final fallback (never returns null)

**Results from first run:**
```
Total Processed:    21
TMDB Matches:       0
iTunes Matches:     4
Deity Images:       8
Placeholders:       9
Failed:             0
```

### 2. **Enhanced Upload Form** (`components/UploadForm.tsx`)

Updated `getPosterUrl()` function with:
- **Deity image mapping** - Hardcoded images for 15+ deities
- **Category placeholders** - Different placeholders for devotional/movie/album content
- **Never returns undefined** - Always provides a fallback image
- **Better ordering** - Checks deity images before generic searches

### 3. **Automated Cron Job** (`scripts/cron_poster_sync.js`)

A background job that:
- Runs periodically (recommended: daily at 2 AM)
- Automatically fixes any new missing posters
- Logs results for monitoring
- Prevents the issue from recurring

**Recommended cron schedule:**
```bash
0 2 * * * cd /path/to/tamilring && node scripts/cron_poster_sync.js
```

## Deity Image Mapping

The following deities have dedicated images:
- Murugan, Siva/Shiva, Ganesha/Vinayagar
- Krishna, Vishnu, Perumal
- Lakshmi, Saraswati, Durga, Kali
- Hanuman, Rama, Sai, Ayyappan

## Category Placeholders

- **Devotional**: Temple/spiritual themed image
- **Movie**: Film reel themed image
- **Album**: Music album themed image
- **Default**: Generic music themed image

## Verification

After running the fix script:
```bash
node scripts/comprehensive_poster_fix.js
```

Verify all posters are fixed:
```bash
node scripts/check_missing_posters.js
# Output: Remaining ringtones with missing posters: 0
```

## Future Prevention

1. **Upload Form** now has comprehensive fallbacks - will never create null posters
2. **Cron Job** catches any edge cases that slip through
3. **Monitoring** - Check `poster_fix_stats.json` for trends

## Files Modified

- ✅ `components/UploadForm.tsx` - Enhanced poster fetching logic
- ✅ `scripts/comprehensive_poster_fix.js` - One-time fix script
- ✅ `scripts/cron_poster_sync.js` - Automated background job
- ✅ `scripts/check_missing_posters.js` - Verification script

## Testing

To test the fix manually:
1. Upload a devotional ringtone (e.g., "Murugan song")
2. Check that it gets a deity image automatically
3. Upload a movie ringtone with an obscure movie name
4. Check that it gets a category placeholder

## Monitoring

Check the stats file after each run:
```bash
cat poster_fix_stats.json
```

This shows the breakdown of how posters were sourced (TMDB, iTunes, deity images, placeholders).
