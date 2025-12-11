import { supabase } from '@/lib/supabaseClient';
import { Ringtone } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Download, Music } from 'lucide-react';
import { Metadata } from 'next';
import PlayButton from './PlayButton';
import DownloadButton from './DownloadButton';
import StreamButtons from '@/components/StreamButtons';
import { splitArtists } from '@/lib/utils';

import ShareButton from '@/components/ShareButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: ringtone } = await supabase
    .from('ringtones')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!ringtone) return { title: 'Ringtone Not Found' };

  const musicDir = ringtone.music_director || 'Unknown';

  return {
    title: `${ringtone.title} Ringtone Download - ${ringtone.movie_name} | ${musicDir} | Free MP3`,
    description: `Download ${ringtone.title} ringtone by ${ringtone.singers} from the tamil movie ${ringtone.movie_name}. High quality 320kbps BGM, Cut Songs, and Mass Dialogues for mobile.`,
    alternates: {
      canonical: `/ringtone/${slug}`,
    },
    openGraph: {
      title: `${ringtone.title} Ringtone Download`,
      description: `Download ${ringtone.title} ringtone from ${ringtone.movie_name}.`,
      images: ringtone.poster_url ? [{ url: ringtone.poster_url }] : [],
      type: 'music.song',
    },
  };
}

export default async function RingtonePage({ params }: Props) {
  const { slug } = await params;
  const { data: ringtone } = await supabase
    .from('ringtones')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!ringtone) return <div className="text-center py-20 text-zinc-500">Ringtone not found</div>;

  // Strict AudioObject Schema for "Play" Button
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: `${ringtone.movie_name} - ${ringtone.title} Ringtone`,
    description: `Download ${ringtone.title} high-quality ringtone from the Tamil movie ${ringtone.movie_name} composed by ${ringtone.music_director}.`,
    contentUrl: ringtone.audio_url,
    encodingFormat: 'audio/mpeg',
    duration: 'T0M30S', // Hardcoded standard for Rich Snippet eligibility
    thumbnailUrl: ringtone.poster_url,
    uploadDate: ringtone.created_at,
    isPartOf: {
      '@type': 'MusicAlbum',
      name: ringtone.movie_name
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-neutral-900 relative flex flex-col">
      {/* Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-96 opacity-30 z-0">
        {(ringtone.backdrop_url || ringtone.poster_url) && (
          <Image
            src={ringtone.backdrop_url || ringtone.poster_url}
            alt={ringtone.movie_name}
            fill
            className="object-cover mask-image-gradient"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900" />
      </div>

      <div className="relative z-10 p-4 pt-4 flex-1 pb-32">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-100 hover:text-emerald-500 bg-neutral-800 px-4 py-3 rounded-xl shadow-lg transition-all active:scale-95">
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-base font-semibold">Back</span>
          </Link>

          {/* Top Right Share Button */}
          <ShareButton
            variant="icon"
            title={`${ringtone.title} Ringtone`}
            text={`Download ${ringtone.title} ringtone from ${ringtone.movie_name} on TamilRing!`}
          />
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mt-2">
          <div className="relative w-32 h-48 rounded-xl overflow-hidden shadow-2xl shadow-black/50 bg-neutral-800 flex items-center justify-center">
            {ringtone.poster_url ? (
              <Image
                src={ringtone.poster_url}
                alt={ringtone.movie_name}
                fill
                className="object-cover"
              />
            ) : (
              <Music size={32} className="text-zinc-600" />
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-zinc-100">{ringtone.title}</h1>
            <Link href={`/tamil/movies/${encodeURIComponent(ringtone.movie_name)}`} className="text-zinc-400 text-base hover:text-emerald-500 transition-colors block">
              {ringtone.movie_name} <span className="text-zinc-600">({ringtone.movie_year})</span>
            </Link>

            <div className="flex flex-wrap justify-center gap-1 text-emerald-500 font-medium text-sm">
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
                Music: <Link href={`/tamil/music-directors/${encodeURIComponent(ringtone.music_director)}`} className="text-zinc-300 hover:text-emerald-500 transition-colors">{ringtone.music_director}</Link>
              </div>
            )}
          </div>

          {/* Play & Download Buttons (Share removed from here) */}
          <div className="flex gap-4 w-full max-w-xs justify-center">
            <PlayButton ringtone={ringtone} />
            <DownloadButton ringtone={ringtone} />
          </div>

          {/* Streaming Section */}
          <div className="w-full max-w-sm space-y-2">
            <h3 className="text-zinc-400 text-xs font-semibold text-center tracking-wide uppercase">
              Stream Full Song
            </h3>
            <StreamButtons
              songTitle={ringtone.title}
              artistName={ringtone.singers}
              appleMusicLink={ringtone.apple_music_link}
              spotifyLink={ringtone.spotify_link}
            />
          </div>

          <div className="w-full bg-neutral-800/50 p-6 rounded-2xl mt-8 text-left space-y-4">
            <h3 className="text-zinc-100 font-bold">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Mood</p>
                <p className="text-zinc-300">{ringtone.mood}</p>
              </div>
              <div>
                <p className="text-zinc-500">Downloads</p>
                <p className="text-zinc-300">{ringtone.downloads}</p>
              </div>
              <div>
                <p className="text-zinc-500">Quality</p>
                <p className="text-zinc-300">320kbps</p>
              </div>
              <div>
                <p className="text-zinc-500">Format</p>
                <p className="text-zinc-300">MP3</p>
              </div>
            </div>
          </div>
        </div>
      </div>



      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
