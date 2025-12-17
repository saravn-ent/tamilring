# PHASE 1 - QUICK REFERENCE GUIDE

## 🚀 Quick Start

### Using Cache

```typescript
import { cacheGetOrSet, CacheKeys, CacheTTL } from '@/lib/cache';

// Simple cache-aside pattern
const data = await cacheGetOrSet(
  CacheKeys.homepage.trending(),
  async () => {
    // Your data fetching logic
    const { data } = await supabase.from('ringtones').select('*');
    return data;
  },
  { ttl: CacheTTL.homepage.trending }
);
```

### Invalidating Cache

```typescript
import { invalidateHomepageCache, onRingtoneApproved } from '@/lib/cache';

// Simple invalidation
await invalidateHomepageCache();

// Event-driven invalidation
await onRingtoneApproved({
  ringtoneId: '123',
  slug: 'song-movie-ringtone',
  userId: 'user-id',
  movieName: 'Movie Name',
  artists: ['Singer', 'Music Director'],
});
```

### Adding SEO Metadata

```typescript
import { generateRingtoneMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const ringtone = await fetchRingtone(params.slug);
  return generateRingtoneMetadata(ringtone);
}
```

### Adding Structured Data

```tsx
import StructuredData from '@/components/StructuredData';
import { generateMusicRecordingSchema } from '@/lib/seo';

<StructuredData data={generateMusicRecordingSchema(ringtone)} />
```

### Generating Slugs

```typescript
import { generateRingtoneSlug } from '@/lib/utils/slugify';

const slug = generateRingtoneSlug({
  title: 'Song Title',
  movie_name: 'Movie Name',
});
```

---

## 📋 Cache Keys Reference

```typescript
// Homepage
CacheKeys.homepage.trending()
CacheKeys.homepage.topArtists()
CacheKeys.homepage.topMovies()
CacheKeys.homepage.topContributors()
CacheKeys.homepage.recentRingtones()

// Ringtones
CacheKeys.ringtone.byId(id)
CacheKeys.ringtone.bySlug(slug)
CacheKeys.ringtone.related(id)
CacheKeys.ringtone.stats(id)

// Movies
CacheKeys.movie.byName(name)
CacheKeys.movie.ringtones(name)
CacheKeys.movie.stats(name)

// Artists
CacheKeys.artist.byName(name)
CacheKeys.artist.ringtones(name)
CacheKeys.artist.stats(name)
CacheKeys.artist.topSingers()
CacheKeys.artist.topMusicDirectors()
CacheKeys.artist.topMovieDirectors()

// Users
CacheKeys.user.profile(userId)
CacheKeys.user.ringtones(userId)
CacheKeys.user.stats(userId)
CacheKeys.user.gamification(userId)

// Search
CacheKeys.search.query(query, page)
CacheKeys.search.autocomplete(query)

// Stats
CacheKeys.stats.global()
CacheKeys.stats.trending()
CacheKeys.stats.popular()
```

---

## ⏱️ TTL Reference

```typescript
// Short (5 minutes)
CacheTTL.SHORT // 300s
CacheTTL.homepage.trending
CacheTTL.ringtone.stats
CacheTTL.stats.trending

// Medium (15 minutes)
CacheTTL.MEDIUM // 900s
CacheTTL.movie.ringtones
CacheTTL.artist.ringtones
CacheTTL.stats.global

// Long (1 hour)
CacheTTL.LONG // 3600s
CacheTTL.homepage.topArtists
CacheTTL.ringtone.details
CacheTTL.movie.details
CacheTTL.artist.details

// Very Long (6 hours)
CacheTTL.VERY_LONG // 21600s

// Daily (24 hours)
CacheTTL.DAILY // 86400s
```

---

## 🎯 Invalidation Functions

```typescript
// Homepage
invalidateHomepageCache()

// Ringtones
invalidateRingtoneCache(ringtoneId, slug?)

// Movies
invalidateMovieCache(movieName)

// Artists
invalidateArtistCache(artistName)
invalidateArtistTopLists()

// Users
invalidateUserCache(userId)

// Search
invalidateSearchCache(query?)

// Stats
invalidateStatsCache()

// Event-driven
onRingtoneUploaded({ ringtoneId, userId, movieName?, artists? })
onRingtoneApproved({ ringtoneId, slug, userId, movieName?, artists? })
onRingtoneDeleted({ ringtoneId, slug, userId, movieName?, artists? })
onRingtoneStatsChanged({ ringtoneId, slug, movieName? })
onUserProfileUpdated(userId)
scheduledCacheRefresh()
```

---

## 📊 Cache Statistics

```typescript
import { getCacheStats, resetCacheStats } from '@/lib/cache';

// Get stats
const stats = getCacheStats();
console.log(stats);
// { hits: 100, misses: 20, errors: 0, hitRate: 83.33 }

// Reset stats
resetCacheStats();
```

---

## 🔍 SEO Metadata Generators

```typescript
// Homepage
generateHomeMetadata()

// Ringtone
generateRingtoneMetadata({
  title, movie_name, singers, music_director,
  artwork_url, slug, created_at
})

// Movie
generateMovieMetadata({
  name, poster_url, year, director,
  music_director, ringtone_count
})

// Artist
generateArtistMetadata({
  name, image_url, role, ringtone_count
})

// Search
generateSearchMetadata(query, resultCount?)

// User Profile
generateUserProfileMetadata({
  username, display_name, avatar_url, ringtone_count
})
```

---

## 🏗️ Structured Data Schemas

```typescript
// Organization
generateOrganizationSchema()

// WebSite
generateWebSiteSchema()

// MusicRecording
generateMusicRecordingSchema({
  title, slug, movie_name, singers, music_director,
  artwork_url, duration, created_at, likes, downloads
})

// Movie
generateMovieSchema({
  name, poster_url, year, director,
  music_director, description, ringtones
})

// Person
generatePersonSchema({
  name, image_url, role, description, ringtone_count
})

// BreadcrumbList
generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Movie', url: '/movie/name' },
])

// ItemList
generateItemListSchema({
  name, description, items: [{ title, slug, artwork_url }]
})

// Combine multiple schemas
combineSchemas(schema1, schema2, schema3)
```

---

## 🔗 Slug Functions

```typescript
// Generate slug
generateSlug(text, { maxLength?, lowercase?, separator? })

// Ringtone slug
generateRingtoneSlug({ title, movie_name?, singers? })

// Movie slug
generateMovieSlug(movieName)

// Artist slug
generateArtistSlug(artistName)

// Unique slug
await generateUniqueSlug(baseSlug, existingSlugChecker, maxAttempts?)

// Validate slug
isValidSlug(slug) // true/false

// Sanitize slug
sanitizeSlug(slug)

// Slug to words
slugToWords('my-slug-here') // 'My Slug Here'

// Compare slugs
areSimilarSlugs(slug1, slug2)

// Generate variations
generateSlugVariations(text)

// Migrate slug
migrateSlug(oldSlug, { title, movie_name, singers })
```

---

## 🛠️ Environment Variables

```env
# Redis (already configured from Phase 0)
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token

# Site URL (for SEO)
NEXT_PUBLIC_SITE_URL=https://tamilring.in

# Sentry (to be added)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=

# Analytics (to be added)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

---

## 📁 File Structure

```
lib/
├── cache/
│   ├── redis.ts              # Redis client
│   ├── cache-keys.ts         # Key generation
│   ├── cache-service.ts      # Cache operations
│   ├── cache-invalidation.ts # Invalidation logic
│   └── index.ts              # Exports
├── seo/
│   ├── metadata.ts           # Metadata generation
│   ├── structured-data.ts    # JSON-LD schemas
│   └── index.ts              # Exports
└── utils/
    └── slugify.ts            # Slug utilities

components/
└── StructuredData.tsx        # JSON-LD component

app/
├── sitemap.ts                # Dynamic sitemap
└── robots.ts                 # Robots.txt
```

---

## ✅ Testing Checklist

### Cache Testing
```bash
# Check if Redis is available
import { isCacheAvailable } from '@/lib/cache';
console.log(isCacheAvailable()); // true/false

# Monitor cache stats
import { getCacheStats } from '@/lib/cache';
setInterval(() => {
  console.log(getCacheStats());
}, 60000); // Every minute
```

### SEO Testing
- [ ] Test metadata with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test Twitter cards with [Twitter Validator](https://cards-dev.twitter.com/validator)
- [ ] Test structured data with [Google Rich Results](https://search.google.com/test/rich-results)
- [ ] Validate schema with [Schema.org Validator](https://validator.schema.org/)

### Sitemap Testing
- [ ] Visit `/sitemap.xml` and verify format
- [ ] Check URL count and structure
- [ ] Submit to Google Search Console
- [ ] Monitor crawl stats

---

## 🐛 Debugging

### Cache Not Working?
```typescript
import { isCacheAvailable } from '@/lib/cache';

if (!isCacheAvailable()) {
  console.log('Redis not configured - using fallback');
  // Check environment variables
}
```

### Metadata Not Showing?
```typescript
// Check if metadata is being generated
export async function generateMetadata({ params }) {
  const metadata = generateRingtoneMetadata(ringtone);
  console.log('Generated metadata:', metadata);
  return metadata;
}
```

### Structured Data Errors?
```typescript
// Validate schema before rendering
import { serializeSchema } from '@/lib/seo';

const schema = generateMusicRecordingSchema(ringtone);
console.log('Schema:', serializeSchema(schema));
// Copy and paste into https://validator.schema.org/
```

---

## 📞 Support

For issues or questions:
1. Check console logs for errors
2. Verify environment variables
3. Test with sample data
4. Review documentation in `.agent/` folder

---

**Last Updated**: 2025-12-18  
**Version**: 1.0.0
