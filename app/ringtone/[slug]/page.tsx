import { notFound } from 'next/navigation';
export const revalidate = 3600;
import { supabase } from '@/lib/supabaseClient';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import DownloadSection from './DownloadSection';
import StreamButtons from '@/components/StreamButtons';
import RingtoneSetGuideTrigger from './RingtoneSetGuideTrigger';
import { splitArtists } from '@/lib/utils';
import { cache, Suspense } from 'react';
import { cacheGetOrSet, CacheKeys, CacheTTL } from '@/lib/cache';
import { generateRingtoneMetadata } from '@/lib/seo';
import { generateMusicRecordingSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import SimilarRingtonesSection from '@/components/ringtone/SimilarRingtonesSection';
import { RingtoneGridSkeleton } from '@/components/skeletons';
import TMDBImage from '@/components/TMDBImage';
import BackButton from '@/components/BackButton';
import { Ringtone } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

// Deduped data fetching with Redis caching
const getRingtone = cache(async (slug: string) => {
  return cacheGetOrSet(
    CacheKeys.ringtone.bySlug(slug),
    async () => {
      // 1. Fetch Ringtone (No Join)
      const { data: ringtone } = await supabase
        .from('ringtones')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!ringtone) return null;

      // 2. Fetch Profile manually (if userId exists)
      if (ringtone.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', ringtone.user_id)
          .single();

        if (profile) {
          (ringtone as Ringtone).profile = profile;
        }
      }

      return ringtone;
    },
    { ttl: CacheTTL.ringtone.details }
  );
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ringtone = await getRingtone(slug);

  if (!ringtone) return { title: 'Ringtone Not Found' };

  // Use our SEO metadata generator
  return generateRingtoneMetadata(ringtone);
}

export default async function RingtonePage({ params }: Props) {
  const { slug } = await params;
  const ringtone = await getRingtone(slug);

  if (!ringtone) notFound();

  const cleanTitle = ringtone.title.replace(/\(From ".*?"\)/i, '').trim();

  // Generate structured data using our SEO system
  const musicRecordingSchema = generateMusicRecordingSchema(ringtone);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Tamil Ringtones', url: '/categories' },
    { name: ringtone.movie_name, url: `/movie/${encodeURIComponent(ringtone.movie_name)}` },
    { name: cleanTitle, url: `/ringtone/${ringtone.slug}` },
  ]);
  const combinedSchema = combineSchemas(musicRecordingSchema, breadcrumbSchema);

  return (
    <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto min-h-screen bg-background relative flex flex-col transition-colors duration-300">
      {/* Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-96 opacity-30 z-0">
        <TMDBImage
          path={ringtone.backdrop_url || ringtone.poster_url}
          alt=""
          fallbackAlt={ringtone.movie_name}
          fill
          priority
          sizes="100vw"
          className="object-cover mask-image-gradient"
          size="w780"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-background" />
      </div>

      <div className="relative z-10 p-4 pt-4 flex-1 pb-12 sm:pb-16">
        {/* Top Navigation: Back & How to Set */}
        <div className="flex items-center justify-between mb-6">
          <BackButton variant="hero" fallbackHref="/" />

          <div className="flex items-center gap-3">
            <RingtoneSetGuideTrigger variant="header" />
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mt-2">
          {/* M3 Elevated Poster */}
          <div className="relative w-36 h-52 rounded-2xl overflow-hidden m3-elevation-2 bg-m3-surface-container border border-m3-outline-variant/40 flex items-center justify-center">
            <TMDBImage
              path={ringtone.poster_url}
              alt=""
              fallbackAlt={ringtone.movie_name}
              fill
              priority
              quality={85}
              sizes="(max-width: 640px) 50vw, 144px"
              className="object-cover"
            />
          </div>

          <div className="space-y-1.5 w-full max-w-md">
            {(() => {
              // ROBUST TITLE GENERATION: [Segment Name] - [Song Name]
              let segment = ringtone.title;
              const song = ringtone.song_name ? ringtone.song_name.trim() : '';
              const movie = ringtone.movie_name ? ringtone.movie_name.trim() : '';

              // Clean helper
              const cleanText = (text: string, toRemove: string) => {
                if (!toRemove) return text;
                const escaped = toRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return text.replace(new RegExp(escaped, 'gi'), '').trim();
              };

              // 1. Remove Movie Name
              segment = cleanText(segment, movie);

              // 2. Remove Song Name
              if (song) {
                segment = cleanText(segment, song);
              }

              // 3. Remove "Vocal" tag
              segment = segment.replace(/\bVocal\b/gi, '').trim();

              // 4. Clean extra separators/brackets
              segment = segment
                .replace(/\(From.*?\)/gi, '')
                .replace(/^[-–—:|]+|[-–—:|]+$/g, '')
                .replace(/\s+[-–—:|]+\s+/g, ' - ')
                .trim();

              // 5. Construct Final Title
              let displayTitle = '';
              if (segment && song) {
                displayTitle = `${segment} - ${song}`;
              } else if (segment) {
                displayTitle = segment;
              } else if (song) {
                displayTitle = song;
              } else {
                displayTitle = ringtone.title;
              }

              return (
                <h1 className="text-xl sm:text-2xl font-bold text-m3-on-surface tracking-tight leading-snug px-4">
                  {displayTitle}
                </h1>
              );
            })()}

            <Link href={`/movie/${encodeURIComponent(ringtone.movie_name)}`} className="inline-flex items-center gap-1 text-m3-primary font-bold text-base hover:underline transition-colors">
              <span>{ringtone.movie_name}</span>
              {ringtone.movie_year && ringtone.movie_year.trim() !== '' ? (
                <span className="text-m3-outline font-normal">({ringtone.movie_year})</span>
              ) : null}
              <ChevronRight size={16} className="text-m3-primary/70" />
            </Link>

            <div className="flex flex-wrap justify-center gap-1 text-m3-on-surface-variant font-medium text-sm">
              {splitArtists(ringtone.singers).map((singer: string, idx: number, arr: string[]) => (
                <span key={idx} className="flex items-center">
                  <Link
                    href={`/artist/${encodeURIComponent(singer)}`}
                    className="hover:underline hover:text-m3-primary transition-colors"
                  >
                    {singer}
                  </Link>
                  {idx < arr.length - 1 && <span className="mr-1">,</span>}
                </span>
              ))}
            </div>

            {ringtone.music_director && (
              <div className="text-m3-outline text-xs mt-1 flex flex-wrap justify-center gap-1">
                <span>Music:</span>
                {splitArtists(ringtone.music_director).map((md: string, idx: number, arr: string[]) => (
                  <span key={idx} className="flex items-center">
                    <Link href={`/artist/${encodeURIComponent(md)}`} className="text-m3-on-surface-variant font-medium hover:text-m3-primary hover:underline transition-colors">{md}</Link>
                    {idx < arr.length - 1 && <span className="mr-1">,</span>}
                  </span>
                ))}
              </div>
            )}
            {ringtone.movie_director && (
              <div className="text-m3-outline text-xs mt-0.5 flex flex-wrap justify-center gap-1">
                <span>Directed by:</span>
                {splitArtists(ringtone.movie_director).map((dir: string, idx: number, arr: string[]) => (
                  <span key={idx} className="flex items-center">
                    <Link href={`/artist/${encodeURIComponent(dir)}`} className="text-m3-on-surface-variant font-medium hover:text-m3-primary hover:underline transition-colors">{dir}</Link>
                    {idx < arr.length - 1 && <span className="mr-1">,</span>}
                  </span>
                ))}
              </div>
            )}
            {ringtone.lyricist && (
              <div className="text-m3-outline text-xs mt-0.5 flex flex-wrap justify-center gap-1">
                <span>Lyrics:</span>
                {splitArtists(ringtone.lyricist).map((lyr: string, idx: number, arr: string[]) => (
                  <span key={idx} className="flex items-center">
                    <Link href={`/artist/${encodeURIComponent(lyr)}`} className="text-m3-on-surface-variant font-medium hover:text-m3-primary hover:underline transition-colors">{lyr}</Link>
                    {idx < arr.length - 1 && <span className="mr-1">,</span>}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {ringtone.mood && (
                <Link href={`/mood/${ringtone.mood}`} className="px-3 py-1 rounded-full bg-m3-primary-container text-m3-on-primary-container text-[11px] font-bold tracking-wide">
                  {ringtone.mood}
                </Link>
              )}
              {ringtone.tags?.slice(0, 3).map((tag: string) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full bg-m3-surface-container text-m3-outline border border-m3-outline-variant/40 text-[10px] font-medium hover:text-m3-primary hover:border-m3-primary transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {ringtone.cast_members && (
              <div className="text-m3-outline text-[11px] mt-2 max-w-xs mx-auto">
                Cast: {ringtone.cast_members}
              </div>
            )}
          </div>

          {/* Action Section (Play, Download, Stats) */}
          <DownloadSection ringtone={ringtone} />

          <div className="h-2" />

          {/* Streaming Section */}
          <div className="w-full max-w-sm mt-3 pt-5 border-t border-m3-outline-variant/40 flex flex-col items-center">
            <StreamButtons
              songTitle={ringtone.song_name || cleanTitle}
              artistName={[ringtone.music_director, ringtone.singers].filter(Boolean).join(', ')}
              movieName={ringtone.movie_name}
              appleMusicLink={ringtone.apple_music_link}
              spotifyLink={ringtone.spotify_link}
            />
          </div>
        </div>

        {/* Similar Ringtones Section - Suspended */}
        <Suspense fallback={<RingtoneGridSkeleton count={4} />}>
          <SimilarRingtonesSection ringtone={ringtone} />
        </Suspense>
      </div>

      <StructuredData data={combinedSchema} />
    </div>
  );
}

