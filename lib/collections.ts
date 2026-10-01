/**
 * Programmatic SEO Landing Page Config
 * Each entry defines a /ringtones/[slug] page with its own:
 *  - title, description, keywords (for metadata)
 *  - query: the Supabase filter to apply
 *  - relatedSlugs: for internal cross-linking
 */

export type RingtoneCollectionQuery =
    | { type: 'music_director'; value: string }
    | { type: 'mood'; value: string }
    | { type: 'year'; value: string }
    | { type: 'tags'; value: string }
    | { type: 'era'; startYear: number; endYear: number };

export interface RingtoneCollectionConfig {
    slug: string;
    title: string;                // Page H1 + OG title
    metaTitle: string;            // <title> tag (50-60 chars)
    description: string;          // Meta description
    keywords: string[];
    heroLabel: string;            // Small badge above H1
    query: RingtoneCollectionQuery;
    relatedSlugs: string[];
    canonicalArtistHref?: string; // Link to artist page if applicable
}

const CONFIGS: RingtoneCollectionConfig[] = [
    // ─── MAESTROS ─────────────────────────────────────────────────────────────
    {
        slug: 'anirudh',
        title: 'Anirudh Ravichander Ringtones',
        metaTitle: 'Anirudh Ringtones — Best BGM Download',
        description: 'Download the best Anirudh Ravichander ringtones and BGM. Mass intros, love melodies, and interval BGMs from Leo, Jailer, Vikram, KGF, and more. Free MP3 & M4R.',
        keywords: ['anirudh ringtones', 'anirudh bgm download', 'anirudh ravichander ringtones', 'anirudh mass bgm', 'leo bgm ringtone', 'vikram bgm ringtone', 'jailer bgm'],
        heroLabel: 'Music Director',
        query: { type: 'music_director', value: 'Anirudh' },
        relatedSlugs: ['mass-bgm', 'love-bgm', 'yuvan', 'harris-jayaraj'],
        canonicalArtistHref: '/artist/Anirudh%20Ravichander',
    },
    {
        slug: 'ar-rahman',
        title: 'A.R. Rahman Ringtones',
        metaTitle: 'AR Rahman Ringtones — Free Tamil BGM Download',
        description: 'Download A.R. Rahman Tamil ringtones and BGM. Soulful melodies, spiritual anthems, and iconic BGMs from Roja, Bombay, Kadal, Mersal and more. Free MP3 & M4R.',
        keywords: ['ar rahman ringtones', 'ar rahman bgm download', 'ar rahman tamil songs ringtone', 'roja bgm', 'allah ke bande ringtone', 'rahman bgm'],
        heroLabel: 'Music Director',
        query: { type: 'music_director', value: 'A.R. Rahman' },
        relatedSlugs: ['love-bgm', 'melody-ringtones', 'ilaiyaraaja', 'yuvan'],
        canonicalArtistHref: '/artist/A.R.%20Rahman',
    },
    {
        slug: 'yuvan',
        title: 'Yuvan Shankar Raja Ringtones',
        metaTitle: 'Yuvan Shankar Raja Ringtones — BGM Download',
        description: 'Download Yuvan Shankar Raja ringtones and BGM. Romantic melodies, bass-heavy beats, and cult BGMs from Mankatha, Vinnaithaandi Varuvaayaa, and 96. Free MP3 & M4R.',
        keywords: ['yuvan shankar raja ringtones', 'yuvan bgm download', 'yuvan ringtones tamil', 'mankatha bgm', 'vinnaithaandi bgm', '96 bgm ringtone'],
        heroLabel: 'Music Director',
        query: { type: 'music_director', value: 'Yuvan Shankar Raja' },
        relatedSlugs: ['love-bgm', 'sad-bgm', 'ar-rahman', 'harris-jayaraj'],
        canonicalArtistHref: '/artist/Yuvan%20Shankar%20Raja',
    },
    {
        slug: 'harris-jayaraj',
        title: 'Harris Jayaraj Ringtones',
        metaTitle: 'Harris Jayaraj Ringtones — BGM Download Tamil',
        description: 'Download Harris Jayaraj ringtones and BGM. Legendary melodies and mass BGMs from Ghajini, Unnale Unnale, Vettaiyaadu Vilaiyaadu, and Singam. Free MP3 & M4R.',
        keywords: ['harris jayaraj ringtones', 'harris jayaraj bgm download', 'ghajini bgm', 'singam bgm ringtone', 'harris bgm', 'harris jayaraj love songs'],
        heroLabel: 'Music Director',
        query: { type: 'music_director', value: 'Harris Jayaraj' },
        relatedSlugs: ['love-bgm', 'mass-bgm', 'yuvan', 'ar-rahman'],
        canonicalArtistHref: '/artist/Harris%20Jayaraj',
    },
    {
        slug: 'ilaiyaraaja',
        title: 'Ilaiyaraaja Ringtones',
        metaTitle: 'Ilaiyaraaja Ringtones — Classic Tamil BGM Download',
        description: 'Download Ilaiyaraaja ringtones and BGM. Timeless classics, folk melodies, and evergreen songs from the Golden Era of Tamil cinema. Free MP3 & M4R download.',
        keywords: ['ilaiyaraaja ringtones', 'ilaiyaraaja bgm download', 'ilayaraja ringtones', 'ilaiyaraaja classic songs', 'golden era tamil bgm', '80s 90s tamil ringtones'],
        heroLabel: 'Music Director',
        query: { type: 'music_director', value: 'Ilaiyaraaja' },
        relatedSlugs: ['80s-hits', '90s-hits', 'ar-rahman', 'melody-ringtones'],
        canonicalArtistHref: '/artist/Ilaiyaraaja',
    },
    {
        slug: 'd-imman',
        title: 'D. Imman Ringtones',
        metaTitle: 'D. Imman Ringtones — BGM & Melody Download',
        description: 'Download D. Imman ringtones and BGM. Emotional melodies, devotional songs, and powerful BGMs from Viswasam, Ajith hits, and Thalapathy films. Free MP3 & M4R.',
        keywords: ['d imman ringtones', 'd imman bgm download', 'imman bgm', 'viswasam bgm ringtone', 'd imman melody ringtones'],
        heroLabel: 'Music Director',
        query: { type: 'music_director', value: 'D. Imman' },
        relatedSlugs: ['love-bgm', 'sad-bgm', 'mass-bgm', 'ilaiyaraaja'],
        canonicalArtistHref: '/artist/D.%20Imman',
    },

    // ─── MOODS ────────────────────────────────────────────────────────────────
    {
        slug: 'love-bgm',
        title: 'Tamil Love BGM Ringtones',
        metaTitle: 'Tamil Love BGM Ringtones — Free Download',
        description: 'Download the best Tamil love BGM ringtones. Romantic melodies, soft violin themes, and heart-touching background scores for your phone. Free MP3 & M4R.',
        keywords: ['tamil love bgm ringtones', 'love bgm download tamil', 'romantic tamil ringtone', 'tamil love ringtone', 'soft bgm ringtone tamil', 'love melody ringtone'],
        heroLabel: 'Mood Collection',
        query: { type: 'mood', value: 'Love' },
        relatedSlugs: ['sad-bgm', 'melody-ringtones', 'yuvan', 'ar-rahman'],
    },
    {
        slug: 'sad-bgm',
        title: 'Tamil Sad BGM Ringtones',
        metaTitle: 'Tamil Sad BGM Ringtones — Free Download',
        description: 'Download the saddest Tamil BGM ringtones. Emotional violin themes, heartbreak melodies, and melancholic background scores. Free MP3 & M4R for Android and iPhone.',
        keywords: ['tamil sad bgm ringtones', 'sad tamil ringtone download', 'emotional bgm ringtone', 'heartbreak tamil bgm', 'sad melody ringtone tamil'],
        heroLabel: 'Mood Collection',
        query: { type: 'mood', value: 'Sad' },
        relatedSlugs: ['love-bgm', 'melody-ringtones', 'yuvan', 'd-imman'],
    },
    {
        slug: 'mass-bgm',
        title: 'Tamil Mass BGM Ringtones',
        metaTitle: 'Tamil Mass BGM Ringtones — Punch BGM Download',
        description: 'Download mass Tamil BGM ringtones. Powerful intro BGMs, punch dialogues, elevation themes from Vijay, Ajith, Rajinikanth films. Free MP3 & M4R.',
        keywords: ['tamil mass bgm ringtones', 'mass bgm download tamil', 'punch bgm ringtone', 'vijay mass bgm', 'rajinikanth bgm', 'elevation bgm ringtone'],
        heroLabel: 'Mood Collection',
        query: { type: 'mood', value: 'Mass' },
        relatedSlugs: ['anirudh', 'harris-jayaraj', '2025-hits', '2024-hits'],
    },
    {
        slug: 'melody-ringtones',
        title: 'Tamil Melody Ringtones',
        metaTitle: 'Tamil Melody Ringtones — Soft Song Download',
        description: 'Download the best Tamil melody ringtones. Soulful soft songs, flute melodies, and gentle background scores perfect for your phone. Free MP3 & M4R.',
        keywords: ['tamil melody ringtones', 'melody ringtone download tamil', 'soft tamil ringtone', 'tamil melody songs ringtone', 'kuthu melody ringtone'],
        heroLabel: 'Mood Collection',
        query: { type: 'mood', value: 'Melody' },
        relatedSlugs: ['love-bgm', 'sad-bgm', 'ar-rahman', 'ilaiyaraaja'],
    },

    // ─── YEARS ────────────────────────────────────────────────────────────────
    {
        slug: '2025-hits',
        title: 'Tamil Ringtones 2025 — Latest Hits',
        metaTitle: 'Tamil Ringtones 2025 — Latest BGM Download',
        description: 'Download the latest Tamil ringtones from 2025 movies. New BGMs, title tracks, and songs from the freshest Kollywood releases. Free MP3 & M4R.',
        keywords: ['tamil ringtones 2025', 'latest tamil ringtones 2025', 'new tamil bgm 2025', 'kollywood 2025 ringtones', '2025 tamil movie ringtones'],
        heroLabel: '2025 Releases',
        query: { type: 'year', value: '2025' },
        relatedSlugs: ['2024-hits', 'mass-bgm', 'anirudh', 'recent-ringtones'],
    },
    {
        slug: '2024-hits',
        title: 'Tamil Ringtones 2024 — Best of the Year',
        metaTitle: 'Tamil Ringtones 2024 — Best BGM Download',
        description: 'Download the best Tamil ringtones from 2024. Top BGMs, title tracks and songs from Leo, Jailer, Captain Miller, Ayalaan and more. Free MP3 & M4R.',
        keywords: ['tamil ringtones 2024', 'best tamil ringtones 2024', 'new tamil bgm 2024', 'kollywood 2024 ringtones', '2024 tamil movie ringtones', 'leo ringtone', 'jailer bgm'],
        heroLabel: '2024 Releases',
        query: { type: 'year', value: '2024' },
        relatedSlugs: ['2025-hits', 'anirudh', 'mass-bgm', 'love-bgm'],
    },

    // ─── ERAS ─────────────────────────────────────────────────────────────────
    {
        slug: '90s-hits',
        title: '90s Tamil Ringtones — Classic Melodies',
        metaTitle: '90s Tamil Ringtones — Classic Melody Download',
        description: 'Download nostalgic 90s Tamil ringtones. Evergreen melodies and BGMs from the golden era of Tamil cinema by Ilaiyaraaja, AR Rahman, and Deva. Free MP3 & M4R.',
        keywords: ['90s tamil ringtones', 'tamil 90s melody ringtones', '90s kollywood ringtones', 'classic tamil ringtones', 'ilaiyaraaja 90s ringtones', 'ar rahman 90s bgm'],
        heroLabel: "90s Classics",
        query: { type: 'era', startYear: 1990, endYear: 1999 },
        relatedSlugs: ['80s-hits', 'ilaiyaraaja', 'ar-rahman', 'melody-ringtones'],
    },
    {
        slug: '80s-hits',
        title: '80s Tamil Ringtones — Golden Era Classics',
        metaTitle: '80s Tamil Ringtones — Ilaiyaraaja Classics',
        description: 'Download timeless 80s Tamil ringtones. Golden era classics, folk melodies, and Ilaiyaraaja masterpieces from the greatest decade of Tamil music. Free MP3 & M4R.',
        keywords: ['80s tamil ringtones', 'tamil 80s songs ringtone', 'golden era tamil ringtones', 'ilaiyaraaja 80s ringtones', 'classic kollywood ringtones'],
        heroLabel: "80s Golden Era",
        query: { type: 'era', startYear: 1980, endYear: 1989 },
        relatedSlugs: ['90s-hits', 'ilaiyaraaja', 'melody-ringtones'],
    },
];

/** Map from slug → config for O(1) lookup */
export const COLLECTION_CONFIG_MAP = new Map<string, RingtoneCollectionConfig>(
    CONFIGS.map(c => [c.slug, c])
);

/** All valid slugs — used for generateStaticParams */
export const ALL_COLLECTION_SLUGS = CONFIGS.map(c => c.slug);

export default CONFIGS;
