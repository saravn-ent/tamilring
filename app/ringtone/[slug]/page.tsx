import { notFound } from 'next/navigation';
export const revalidate = 0;
import { supabase } from '@/lib/supabaseClient';

import Link from 'next/link';
import { ChevronRight, Download } from 'lucide-react';
import { Metadata } from 'next';
import PlayButton from './PlayButton';
import DownloadButton from './DownloadButton';
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

      <div className="relative z-10 p-4 pt-4 flex-1 pb-24">
        {/* Top Right Buttons: Back & Video/Pinterest */}
        <div className="flex items-center justify-between mb-6">
          <BackButton fallbackHref="/" className="shadow-sm" />

          {/* Social & Video Actions */}
          <div className="flex items-center gap-3">
            <RingtoneSetGuideTrigger variant="header" />
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mt-2">
          <div className="relative w-32 h-48 rounded-xl overflow-hidden shadow-2xl shadow-brand-dark/20 bg-brand-wash flex items-center justify-center">
            <TMDBImage
              path={ringtone.poster_url}
              alt=""
              fallbackAlt={ringtone.movie_name}
              fill
              priority
              quality={85}
              sizes="(max-width: 640px) 50vw, 128px"
              className="object-cover"
            />
          </div>

          <div className="space-y-1">
            {(() => {
              // ROBUST TITLE GENERATION: [Segment Name] - [Song Name]
              let segment = ringtone.title;
              const song = ringtone.song_name ? ringtone.song_name.trim() : '';
              const movie = ringtone.movie_name ? ringtone.movie_name.trim() : '';

              // Clean helper
              const cleanText = (text: string, toRemove: string) => {
                if (!toRemove) return text;
                const escaped = toRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Remove the text anywhere in the string (case insensitive)
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
                .replace(/^[-–—:|]+|[-–—:|]+$/g, '') // remove leading/trailing separators
                .replace(/\s+[-–—:|]+\s+/g, ' - ') // normalize middle separators
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
                displayTitle = ringtone.title; // Fallback
              }

              return (
                <h1 className="text-2xl font-black text-brand-dark tracking-tight leading-tight px-4">
                  {displayTitle}
                </h1>
              );
            })()}
            <Link href={`/movie/${encodeURIComponent(ringtone.movie_name)}`} className="inline-flex items-center gap-1 text-brand-accent font-medium text-base hover:underline transition-colors">
              {ringtone.movie_name} <span className="text-zinc-400 font-normal">({ringtone.movie_year})</span>
              <ChevronRight size={16} className="text-brand-accent/70" />
            </Link>

            <div className="flex flex-wrap justify-center gap-1 text-brand-dark font-medium text-sm">
              {splitArtists(ringtone.singers).map((singer: string, idx: number, arr: string[]) => (
                <span key={idx} className="flex items-center">
                  <Link
                    href={`/artist/${encodeURIComponent(singer)}`}
                    className="hover:underline"
                  >
                    {singer}
                  </Link>
                  {idx < arr.length - 1 && <span className="mr-1">,</span>}
                </span>
              ))}
            </div>

            {ringtone.music_director && (
              <div className="text-zinc-500 text-xs mt-1">
                Music: <Link href={`/artist/${encodeURIComponent(ringtone.music_director)}`} className="text-zinc-700 hover:text-brand-accent transition-colors">{ringtone.music_director}</Link>
              </div>
            )}
          </div>

          {/* Play & Download Buttons */}
          <div className="flex flex-col items-center gap-3 w-full max-w-sm">
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <PlayButton ringtone={ringtone} />
              <div className="flex-1 min-w-[140px]">
                <DownloadButton ringtone={ringtone} />
              </div>
            </div>
          </div>

          {/* Social Proof Badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500 mt-1">
            {ringtone.profile?.full_name && (
              <>
                <span className="flex items-center gap-1">
                  Uploaded by
                  <Link
                    href={`/user/${ringtone.profile.id}`}
                    className="text-brand-accent hover:underline decoration-brand-accent/30 underline-offset-2 transition-all"
                  >
                    {ringtone.profile.full_name}
                  </Link>
                </span>
                <span className="text-zinc-300 mx-1">|</span>
              </>
            )}
            <Download size={14} className="text-brand-accent/80" />
            <span><span className="text-brand-dark">{ringtone.downloads?.toLocaleString() || 0}</span> people downloaded this</span>
          </div>

          <div className="h-4" />


          {/* Streaming Section - The "Safe Zone" */}
          <div className="w-full max-w-sm mt-4 pt-6 border-t border-zinc-100 flex flex-col items-center">
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
    </div >
  );
}
