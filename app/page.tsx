import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import SectionHeader from '@/components/SectionHeader';
import Chip from '@/components/Chip';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 0; // Disable caching for real-time updates

export default async function Home() {
  // 1. Fetch Trending (Top 5 by downloads - mocked for now as downloads col might be empty, using created_at)
  const { data: trending } = await supabase
    .from('ringtones')
    .select('*')
    .order('created_at', { ascending: false }) // TODO: Change to downloads when available
    .limit(5);

  // 2. Fetch Recent
  const { data: recent } = await supabase
    .from('ringtones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // 3. Hero Movie (Random one from trending)
  const heroRingtone = trending?.[0];

  const MOODS = ["Love", "Mass", "Sad", "BGM", "Funny", "Melody", "Remix"];

  return (
    <div className="max-w-md mx-auto pb-20">
      
      {/* Hero Section */}
      {heroRingtone && (
        <div className="relative h-[40vh] w-full mb-6">
          {heroRingtone.backdrop_url ? (
             <Image 
               src={heroRingtone.backdrop_url} 
               alt="Hero" 
               fill 
               className="object-cover"
               priority
             />
          ) : (
            <div className="w-full h-full bg-neutral-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/20 to-neutral-900" />
          
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <span className="px-2 py-1 bg-emerald-500 text-neutral-900 text-[10px] font-bold rounded uppercase mb-2 inline-block">Featured</span>
            <h1 className="text-3xl font-bold text-white mb-1 leading-tight drop-shadow-lg">{heroRingtone.movie_name}</h1>
            <p className="text-zinc-300 text-sm drop-shadow-md line-clamp-1">{heroRingtone.title}</p>
            
            <Link href={`/movie/${encodeURIComponent(heroRingtone.movie_name)}`} className="mt-4 inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
                View Album
            </Link>
          </div>
        </div>
      )}

      {/* Browse by Mood */}
      <div className="mb-8">
        <SectionHeader title="Browse by Mood" />
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {MOODS.map(mood => (
            <Chip key={mood} label={mood} href={`/mood/${mood}`} />
          ))}
        </div>
      </div>

      {/* Trending Section (Horizontal) */}
      <div className="mb-8">
        <SectionHeader title="Trending Now" />
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
          {trending?.map(ringtone => (
            <div key={ringtone.id} className="snap-start shrink-0 w-36">
               <div className="relative w-36 h-36 rounded-xl overflow-hidden mb-2 bg-neutral-800">
                 {ringtone.poster_url ? (
                    <Image src={ringtone.poster_url} alt={ringtone.title} fill className="object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No Img</div>
                 )}
                 <div className="absolute inset-0 bg-black/20" />
               </div>
               <p className="text-sm font-medium text-white truncate">{ringtone.title}</p>
               <p className="text-xs text-zinc-500 truncate">{ringtone.movie_name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Just Added (Vertical) */}
      <div>
        <SectionHeader title="Just Added" href="/search" />
        <div className="px-4 space-y-4">
          {recent?.map(ringtone => (
            <RingtoneCard key={ringtone.id} ringtone={ringtone} />
          ))}
        </div>
      </div>

    </div>
  );
}
