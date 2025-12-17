# 🎉 Upload Form Testing Guide

## ✅ Dev Mode is Now Active!

The upload form is now accessible at **http://localhost:3000/upload** without requiring login.

### What You'll See

At the top of the form, you'll see a **yellow banner**:
```
🔧 DEV MODE - UI Testing Only (No data will be saved)
```

This means:
- ✅ No authentication required
- ✅ You can test the entire UI flow
- ✅ No data will be saved to the database
- ✅ You'll see console logs of what would be saved

---

## 🧪 How to Test Each Content Type

### 1️⃣ Testing Movie Upload Flow

**Steps:**
1. Go to http://localhost:3000/upload
2. Upload an audio file (any MP3/M4A)
3. **Trim the audio** using the waveform slider
4. Click "Continue"
5. **Select "Movie Song"** (Film icon)
6. **Search for a movie** (e.g., "Thegidi", "Vikram", "Leo")
7. Select a movie from the dropdown
8. **Select a song** from iTunes dropdown (or enter manually)
9. Enter **Ringtone Name** (e.g., "Pallavi", "BGM")
10. Fill in any missing details (singers, director, etc.)
11. **Select tags** (they auto-populate based on movie genre)
12. Click **"Upload Ringtone"**

**Expected Result:**
- Alert: "✅ DEV MODE: Upload form completed successfully! Content Type: movie"
- Console log showing the data that would be saved
- Form resets to step 1

---

### 2️⃣ Testing Album Upload Flow

**Steps:**
1. Go to http://localhost:3000/upload
2. Upload an audio file
3. Trim the audio
4. Click "Continue"
5. **Select "Album / Independent Artist"** (Music icon)
6. Enter **Album Name** (e.g., "Kadhal Kavithai")
7. Enter **Song Name** (e.g., "Unnai Ninaithu")
8. Enter **Ringtone Name** (e.g., "Pallavi")
9. **Use Artist Autocomplete:**
   - Start typing an artist name
   - See suggestions from existing database
   - Select or enter a new name
10. **Use Music Director Autocomplete** (same as above)
11. **Select tags** (Love, Sad, Male, Female, etc.)
12. Click **"Upload Ringtone"**

**Expected Result:**
- Alert: "✅ DEV MODE: Upload form completed successfully! Content Type: album"
- Console log showing album data
- Form resets

**What to Test:**
- ✅ Artist autocomplete shows suggestions
- ✅ Can enter new artist names
- ✅ Music director autocomplete works
- ✅ Slug preview updates correctly
- ✅ Duplicate checking works

---

### 3️⃣ Testing Devotional Upload Flow

**Steps:**
1. Go to http://localhost:3000/upload
2. Upload an audio file
3. Trim the audio
4. Click "Continue"
5. **Select "Devotional Song"** (Heart icon)
6. **Select a Deity** from dropdown:
   - Hindu: Ayyappan, Murugan, Karuppusamy, etc.
   - Christian: Jesus, Mary, Saint
   - Muslim: Allah
   - Other: Buddha, Mahavira
7. Enter **Song Name** (e.g., "Ayyappa Saranam")
8. Enter **Ringtone Name** (e.g., "Pallavi")
9. **Use Artist Autocomplete** for singer
10. **Use Music Director Autocomplete**
11. **Notice:** "Devotional" tag is auto-selected
12. Select additional tags
13. Click **"Upload Ringtone"**

**Expected Result:**
- Alert: "✅ DEV MODE: Upload form completed successfully! Content Type: devotional"
- Console log showing devotional data with deity
- "Devotional" tag automatically included
- Form resets

**What to Test:**
- ✅ Deity dropdown organized by religion
- ✅ "Devotional" tag auto-added when deity selected
- ✅ Artist autocomplete works
- ✅ Slug includes deity name

---

## 🎯 Key Features to Verify

### Content Type Selection (Step 1.8)
- [ ] Three beautiful card options appear
- [ ] Icons display correctly (Film, Music, Heart)
- [ ] Descriptions are clear
- [ ] Check mark appears on selected option
- [ ] Clicking navigates to correct step

### Progress Indicator
- [ ] Shows: `1. File → Trim → Type → 2. Source → 3. Details`
- [ ] Highlights current step in emerald green
- [ ] Updates correctly as you progress

### Artist Autocomplete
- [ ] Search icon appears
- [ ] Typing triggers search after 2 characters
- [ ] Dropdown shows existing artists
- [ ] Can select from dropdown
- [ ] Can enter new artist name
- [ ] Shows "No existing artists found" message when appropriate
- [ ] Loading spinner appears during search

### Deity Selector
- [ ] Dropdown organized by religion (optgroups)
- [ ] All deities listed correctly
- [ ] Selecting deity auto-adds "Devotional" tag

### Form Validation
- [ ] Submit button disabled when required fields empty
- [ ] Different required fields per content type:
  - Movie: requires movie name
  - Album: requires album name, song name
  - Devotional: requires deity, song name
- [ ] Duplicate slug checking works
- [ ] Error messages display correctly

### Back Navigation
- [ ] Step 2 (Movie Search) → Back goes to Step 1.8 (Type Selection)
- [ ] Step 3 (Album/Devotional) → Back goes to Step 1.8
- [ ] Step 1.8 → Back goes to Step 1.5 (Trim)

---

## 🔍 Console Logs to Check

When you submit in dev mode, check the browser console (F12) for:

```javascript
🔧 DEV MODE: Using demo user ID for testing
🔧 DEV MODE: Skipping database insert. Data would be: {
  user_id: "demo-user-123",
  title: "Song Name - Pallavi",
  slug: "...",
  singers: "...",
  music_director: "...",
  // ... rest of the data
}
```

This shows exactly what would be saved to the database in production.

---

## 🚀 When Ready for Production

To disable dev mode and enable real authentication + database saves:

**In `components/UploadForm.tsx`:**

Change line 21 from:
```typescript
const DEV_MODE = true;
```

To:
```typescript
const DEV_MODE = false;
```

Then:
- Users will need to log in
- Data will be saved to Supabase
- Admin notifications will be sent
- No dev mode banner will show

---

## 📸 Screenshots to Take

For documentation, capture screenshots of:
1. ✅ Dev mode banner
2. ✅ Content type selection (Step 1.8)
3. ✅ Movie form with TMDB search
4. ✅ Album form with artist autocomplete
5. ✅ Devotional form with deity dropdown
6. ✅ Success alert in dev mode

---

## 🐛 Troubleshooting

**Issue:** Upload form shows "Login Required"
- **Fix:** Make sure `DEV_MODE = true` in UploadForm.tsx line 21

**Issue:** Artist autocomplete not working
- **Fix:** Check that `/api/artists/search` endpoint exists

**Issue:** TMDB search not working
- **Fix:** Check TMDB API key in environment variables

**Issue:** Audio trimming not working
- **Fix:** FFmpeg may not be loaded, check browser console

---

## ✨ Next Steps After Testing

1. **Test all three flows** thoroughly
2. **Take screenshots** for documentation
3. **Report any bugs** or UI improvements
4. **Decide on database schema** enhancement (optional)
5. **Set `DEV_MODE = false`** when ready for production
6. **Deploy** to production!

---

**Happy Testing! 🎉**

The upload form now supports Movie, Album, and Devotional content with beautiful UIs and smart features!
