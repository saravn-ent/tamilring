import { notFound } from 'next/navigation';
export const revalidate = 3600;
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
    <div className="max-w-md mx-auto min-h-screen bg-background relative flex flex-col transition-colors duration-300">
      {/* Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-96 opacity-30 z-0">
        {(ringtone.backdrop_url || ringtone.poster_url) && (
          <Image
            src={getImageUrl(ringtone.backdrop_url || ringtone.poster_url)}
            alt={ringtone.movie_name}
            fill
            priority
            sizes="100vw"
            className="object-cover mask-image-gradient"
          />
        )}
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
            {ringtone.poster_url ? (
              <Image
                src={getImageUrl(ringtone.poster_url)}
                alt={ringtone.movie_name}
                fill
                priority
                quality={85}
                sizes="(max-width: 640px) 50vw, 128px"
                className="object-cover"
              />
            ) : (
              <Music size={32} className="text-zinc-400" />
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-black">{ringtone.title.replace(/\(From ".*?"\)/i, '').trim()}</h1>
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
