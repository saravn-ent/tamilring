# Backfilling Lyricist Data

## Options for Existing Ringtones

### Option 1: Automated Backfill Script ⭐ (Recommended)

I've created a script that automatically fills lyricist data for all existing ringtones.

**Location**: `scripts/backfill-lyricists.js`

**What it does:**
1. Fetches all ringtones without lyricist data
2. Groups by movie (to avoid duplicate API calls)
3. Looks up TMDB credits for each movie
4. Extracts lyricist names
5. Updates all ringtones for that movie

**How to run:**

```bash
# 1. Add your Supabase service role key to .env.local
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 2. Run the script
node scripts/backfill-lyricists.js
```

**Expected output:**
```
🚀 Starting lyricist backfill...

📊 Found 150 ringtones to process

🎬 Processing 45 unique movies

Processing: Leo...
  ✅ Updated 8 ringtones with: Vivek
Processing: Vikram...
  ✅ Updated 12 ringtones with: Vivek
...

✅ Backfill complete!
   Updated: 120 ringtones
   Skipped: 30 ringtones
```

---

### Option 2: SQL Direct Update

If you know specific lyricists for specific movies, you can update directly:

```sql
-- Update all ringtones from "Leo" movie
UPDATE ringtones 
SET lyricist = 'Vivek' 
WHERE movie_name = 'Leo' 
  AND lyricist IS NULL;

-- Update all ringtones from "Vikram" movie
UPDATE ringtones 
SET lyricist = 'Vivek' 
WHERE movie_name = 'Vikram' 
  AND lyricist IS NULL;
```

---

### Option 3: Manual via Admin Panel

If you have an admin panel, add a "Bulk Edit" feature to update lyricist for multiple ringtones at once.

---

### Option 4: Do Nothing

Existing ringtones will have `lyricist = NULL`, which is fine:
- They'll still appear in searches
- New uploads will have lyricist data
- You can backfill later when needed

---

## Recommendation

**Use Option 1** (the backfill script) because:
- ✅ Fully automated
- ✅ Uses TMDB as source of truth
- ✅ Handles all movies at once
- ✅ Rate-limited to avoid API issues
- ✅ Groups by movie for efficiency

Just add your `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and run the script!
