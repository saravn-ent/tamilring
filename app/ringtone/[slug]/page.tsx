import { notFound } from 'next/navigation';
export const revalidate = 0;
import { supabase } from '@/lib/supabaseClient';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Download, Music } from 'lucide-react';
import { Metadata } from 'next';
import PlayButton from './PlayButton';
import DownloadButton from './DownloadButton';
import VideoDownloadButton from './VideoDownloadButton';
import StreamButtons from '@/components/StreamButtons';
import { splitArtists } from '@/lib/utils';
import { cache } from 'react';
import { cacheGetOrSet, CacheKeys, CacheTTL } from '@/lib/cache';
import { generateRingtoneMetadata } from '@/lib/seo';
import { generateMusicRecordingSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import SimilarRingtones from '@/components/SimilarRingtones';
import { getSimilarRingtones } from '@/app/actions/ringtones';
import { getImageUrl } from '@/lib/tmdb';
import TMDBImage from '@/components/TMDBImage';

interface Props {
  params: Promise<{ slug: string }>;
}

// Deduped data fetching with Redis caching
const getRingtone = cache(async (slug: string) => {
  return cacheGetOrSet(
    CacheKeys.ringtone.bySlug(slug),
    async () => {
      const { data: ringtone } = await supabase
        .from('ringtones')
        .select('*')
        .eq('slug', slug)
        .single();
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
    { name: 'Tamil Ringtones', url: '/tamil' },
    { name: ringtone.movie_name, url: `/movie/${encodeURIComponent(ringtone.movie_name)}` },
    { name: cleanTitle, url: `/ringtone/${ringtone.slug}` },
  ]);
  const combinedSchema = combineSchemas(musicRecordingSchema, breadcrumbSchema);

  // Fetch similar ringtones (AI Recommendations)
  const similarRingtones = await getSimilarRingtones(ringtone);

  return (
    <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto min-h-screen bg-background relative flex flex-col transition-colors duration-300">
      {/* Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-96 opacity-30 z-0">
        <TMDBImage
          path={ringtone.backdrop_url || ringtone.poster_url}
          alt={ringtone.movie_name}
          fill
          priority
          sizes="100vw"
          className="object-cover mask-image-gradient"
          size="w780"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="relative z-10 p-4 pt-4 flex-1 pb-24">
        {/* Top Right Buttons: Back & Video Download */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-accent bg-white border border-brand-gray px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95">
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-base font-semibold">Back</span>
          </Link>

          {/* Video Download (Replaces Share) */}
          <VideoDownloadButton ringtone={ringtone} />
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mt-2">
          <div className="relative w-32 h-48 rounded-xl overflow-hidden shadow-2xl shadow-brand-dark/20 bg-brand-wash flex items-center justify-center">
            <TMDBImage
              path={ringtone.poster_url}
              alt={ringtone.movie_name}
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
            <Link href={`/tamil/movies/${encodeURIComponent(ringtone.movie_name)}`} className="inline-flex items-center gap-1 text-brand-accent font-medium text-base hover:underline transition-colors block">
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
                Music: <Link href={`/tamil/music-directors/${encodeURIComponent(ringtone.music_director)}`} className="text-zinc-700 hover:text-brand-accent transition-colors">{ringtone.music_director}</Link>
              </div>
            )}
          </div>

          {/* Play & Download Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm">
            <PlayButton ringtone={ringtone} />
            <div className="flex-1 min-w-[140px]">
              <DownloadButton ringtone={ringtone} />
            </div>
          </div>

          {/* Social Proof Badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500 mt-1 mb-2">
            <Download size={14} className="text-brand-accent/80" />
            <span><span className="text-brand-dark">{ringtone.downloads?.toLocaleString() || 0}</span> people downloaded this</span>
          </div>

          {/* Streaming Section */}
          <div className="w-full max-w-sm space-y-2">
            <h3 className="text-zinc-500 text-xs font-semibold text-center tracking-wide uppercase">
              Stream Full Song
            </h3>
            <StreamButtons
              songTitle={cleanTitle}
              artistName={ringtone.singers}
              appleMusicLink={ringtone.apple_music_link}
              spotifyLink={ringtone.spotify_link}
            />
          </div>


        </div>

        {/* Similar Ringtones Section */}
        <SimilarRingtones ringtones={similarRingtones} />
      </div>

      <StructuredData data={combinedSchema} />
    </div >
  );
}
