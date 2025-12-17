import { notFound } from 'next/navigation';
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
import { JsonLdScript } from '@/components/JsonLdScript';

interface Props {
  params: Promise<{ slug: string }>;
}

// Deduped data fetching
const getRingtone = cache(async (slug: string) => {
  const { data: ringtone } = await supabase
    .from('ringtones')
    .select('*')
    .eq('slug', slug)
    .single();
  return ringtone;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ringtone = await getRingtone(slug);

  if (!ringtone) return { title: 'Ringtone Not Found' };

  const musicDir = ringtone.music_director || 'Unknown';

  const cleanTitle = ringtone.title.replace(/\(From ".*?"\)/i, '').trim();

  return {
    title: `${cleanTitle} Ringtone Download - ${ringtone.movie_name} | ${musicDir} | Free MP3`,
    description: `Download ${cleanTitle} ringtone by ${ringtone.singers} from the tamil movie ${ringtone.movie_name}. High quality 320kbps BGM, Cut Songs, and Mass Dialogues for mobile.`,
    alternates: {
      canonical: `/ringtone/${slug}`,
    },
    openGraph: {
      title: `${cleanTitle} Ringtone Download`,
      description: `Download ${cleanTitle} ringtone from ${ringtone.movie_name}.`,
      images: ringtone.poster_url ? [{ url: ringtone.poster_url }] : [],
      type: 'music.song',
    },
  };
}

export default async function RingtonePage({ params }: Props) {
  const { slug } = await params;
  const ringtone = await getRingtone(slug);

  if (!ringtone) notFound();

  // Strict AudioObject Schema for "Play" Button
  const cleanTitle = ringtone.title.replace(/\(From ".*?"\)/i, '').trim();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Breadcrumb List
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://tamilring.in'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Tamil Ringtones',
            'item': 'https://tamilring.in/tamil'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': ringtone.movie_name,
            'item': `https://tamilring.in/tamil/movies/${encodeURIComponent(ringtone.movie_name)}`
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': cleanTitle
          }
        ]
      },
      // 2. Audio Object (The Core Content)
      {
        '@type': 'AudioObject',
        'name': `${cleanTitle} - ${ringtone.movie_name}`,
        'description': `Download free ${cleanTitle} ringtone from the Tamil movie ${ringtone.movie_name}. Composed by ${ringtone.music_director}. Quality: 320kbps MP3/M4R.`,
        'contentUrl': ringtone.audio_url,
        'encodingFormat': 'audio/mpeg',
        'duration': 'PT30S', // Changed to PT30S (ISO 8601 standard)
        'thumbnailUrl': ringtone.poster_url,
        'uploadDate': ringtone.created_at,
        'interactionStatistic': {
          '@type': 'InteractionCounter',
          'interactionType': { '@type': 'DownloadAction' },
          'userInteractionCount': ringtone.downloads
        },
        'isPartOf': {
          '@type': 'MusicAlbum',
          'name': ringtone.movie_name
        }
      },
      // 3. FAQ Page (For AEO / Voice Search Answers)
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `How to download ${cleanTitle} ringtone?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `You can download the ${cleanTitle} ringtone for free on TamilRing.in. Click the 'Download' button to save it as an MP3 (for Android) or M4R (for iPhone).`
            }
          },
          {
            '@type': 'Question',
            'name': `Which movie is the song ${cleanTitle} from?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `${cleanTitle} is a song from the Tamil movie '${ringtone.movie_name}', composed by ${ringtone.music_director || 'Unknown'}.`
            }
          }
        ]
      }
    ]
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
            priority
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
            title={`${cleanTitle} Ringtone`}
            text={`Download ${cleanTitle} ringtone from ${ringtone.movie_name} on TamilRing!`}
          />
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mt-2">
          <div className="relative w-32 h-48 rounded-xl overflow-hidden shadow-2xl shadow-black/50 bg-neutral-800 flex items-center justify-center">
            {ringtone.poster_url ? (
              <Image
                src={ringtone.poster_url}
                alt={ringtone.movie_name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <Music size={32} className="text-zinc-600" />
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-zinc-100">{ringtone.title.replace(/\(From ".*?"\)/i, '').trim()}</h1>
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
            <VideoDownloadButton ringtone={ringtone} />
          </div>

          {/* Streaming Section */}
          <div className="w-full max-w-sm space-y-2">
            <h3 className="text-zinc-400 text-xs font-semibold text-center tracking-wide uppercase">
              Stream Full Song
            </h3>
            <StreamButtons
              songTitle={cleanTitle}
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
                <p className="text-zinc-300">MP3 / M4R</p>
              </div>
            </div>
          </div>
        </div>
      </div>



      <JsonLdScript data={jsonLd} />
    </div >
  );
}
