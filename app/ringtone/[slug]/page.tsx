import { notFound } from 'next/navigation';
export const revalidate = 3600;
import { supabase } from '@/lib/supabaseClient';
import { Ringtone } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Download, Music } from 'lucide-react';
import { Metadata } from 'next';
import PlayButton from './PlayButton';
import DownloadButton from './DownloadButton';
import VideoDownloadButton from './VideoDownloadButton';
import StreamButtons from '@/components/StreamButtons';
import { splitArtists } from '@/lib/utils';
import { cache } from 'react';
import ShareButton from '@/components/ShareButton';
import { cacheGetOrSet, CacheKeys, CacheTTL } from '@/lib/cache';
import { generateRingtoneMetadata } from '@/lib/seo';
import { generateMusicRecordingSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import WhatsAppShare from '@/components/WhatsAppShare';
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
            quality={60}
            sizes="100vw"
            className="object-cover mask-image-gradient"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="relative z-10 p-4 pt-4 flex-1 pb-24">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground dark:text-zinc-100 hover:text-emerald-500 bg-zinc-100 dark:bg-neutral-800 px-4 py-3 rounded-xl shadow-lg transition-all active:scale-95">
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-base font-semibold">Back</span>
          </Link>

          {/* Top Right Share Button */}
          <ShareButton
            variant="icon"
            title={`${cleanTitle} Ringtone`}
            text={`Download ${cleanTitle} ringtone from ${ringtone.movie_name} on TamilRing!`}
          />
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mt-2">
          <div className="relative w-32 h-48 rounded-xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/50 bg-zinc-100 dark:bg-neutral-800 flex items-center justify-center">
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
              <Music size={32} className="text-zinc-400 dark:text-zinc-600" />
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{ringtone.title.replace(/\(From ".*?"\)/i, '').trim()}</h1>
            <Link href={`/tamil/movies/${encodeURIComponent(ringtone.movie_name)}`} className="text-zinc-600 dark:text-zinc-400 text-base hover:text-emerald-500 transition-colors block">
              {ringtone.movie_name} <span className="text-zinc-400 dark:text-zinc-600">({ringtone.movie_year})</span>
            </Link>

            <div className="flex flex-wrap justify-center gap-1 text-emerald-600 dark:text-emerald-500 font-medium text-sm">
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
                Music: <Link href={`/tamil/music-directors/${encodeURIComponent(ringtone.music_director)}`} className="text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 transition-colors">{ringtone.music_director}</Link>
              </div>
            )}
          </div>

          {/* Play & Download Buttons (Share removed from here) */}
          <PlayButton ringtone={ringtone} />
          <DownloadButton ringtone={ringtone} />
          <VideoDownloadButton ringtone={ringtone} />

          {/* Streaming Section */}
          <div className="w-full max-w-sm space-y-2">
            <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold text-center tracking-wide uppercase">
              Stream Full Song
            </h3>
            <StreamButtons
              songTitle={cleanTitle}
              artistName={ringtone.singers}
              appleMusicLink={ringtone.apple_music_link}
              spotifyLink={ringtone.spotify_link}
            />
          </div>

          {/* WhatsApp Status Share */}
          <div className="w-full max-w-sm px-4">
            <WhatsAppShare
              title={cleanTitle}
              movie={ringtone.movie_name}
              slug={ringtone.slug}
            />
          </div>

          <div className="w-full bg-zinc-50 dark:bg-neutral-800/50 p-6 rounded-2xl mt-8 text-left space-y-4 border border-zinc-100 dark:border-transparent">
            <h3 className="text-foreground dark:text-zinc-100 font-bold">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Mood</p>
                <p className="text-zinc-700 dark:text-zinc-300">{ringtone.mood}</p>
              </div>
              <div>
                <p className="text-zinc-500">Downloads</p>
                <p className="text-zinc-700 dark:text-zinc-300">{ringtone.downloads}</p>
              </div>
              <div>
                <p className="text-zinc-500">Quality</p>
                <p className="text-zinc-700 dark:text-zinc-300">320kbps</p>
              </div>
              <div>
                <p className="text-zinc-500">Format</p>
                <p className="text-zinc-700 dark:text-zinc-300">MP3 / M4R</p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Ringtones Section */}
        <SimilarRingtones ringtones={similarRingtones} />
      </div>

      <StructuredData data={combinedSchema} />
    </div >
  );
}
