import { User, Heart, Music, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import ImageWithFallback from '@/components/ImageWithFallback';
import { TOP_SINGERS, MUSIC_DIRECTORS, POPULAR_ACTORS } from '@/lib/constants';
import { unstable_cache } from 'next/cache';

const getUserData = unstable_cache(
  async (username: string) => {
    // Fetch all ringtones (In a real app, we would filter by uploader_id)
    // Since we don't have uploader info in DB, we'll fetch all for demo
    const { data: allRingtones } = await supabase
      .from('ringtones')
      .select('*')
      .order('created_at', { ascending: false });

    const ringtones = allRingtones || [];

    // Calculate Aggregate Likes
    const totalLikes = ringtones.reduce((sum, r) => sum + (r.likes || 0), 0);

    // Process Contributions (Group by Artist)
    const artistStats = new Map<string, number>();
    
    ringtones.forEach(r => {
      // Check Music Director
      if (r.music_director) {
        const md = r.music_director.trim();
        artistStats.set(md, (artistStats.get(md) || 0) + 1);
      }
      // Check Singers (Split by comma or &)
      if (r.singers) {
        const singerList = r.singers.split(/,|&/).map(s => s.trim());
        singerList.forEach(s => {
          if (s) artistStats.set(s, (artistStats.get(s) || 0) + 1);
        });
      }
    });

    // Convert to array and sort
    const contributions = Array.from(artistStats.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      ringtones,
      totalLikes,
      contributions
    };
  },
  ['user-profile-data'],
  { revalidate: 60 }
);

export default async function UserProfilePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ username: string }>,
  searchParams: Promise<{ artist?: string }>
}) {
  const { username } = await params;
  const { artist: selectedArtist } = await searchParams;
  const decodedName = decodeURIComponent(username);

  const { ringtones, totalLikes, contributions } = await getUserData(decodedName);

  // Mock Favorites (Random selection from constants)
  const mockFavorites = [
    ...TOP_SINGERS.slice(0, 2),
    ...MUSIC_DIRECTORS.slice(0, 2),
    ...POPULAR_ACTORS.slice(0, 2)
  ];

  // Filtered View Logic
  if (selectedArtist) {
    const artistName = decodeURIComponent(selectedArtist);
    const filteredRingtones = ringtones.filter(r => 
      (r.music_director && r.music_director.includes(artistName)) ||
      (r.singers && r.singers.includes(artistName))
    );

    return (
      <div className="max-w-md mx-auto p-4 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/user/${username}`} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Contributions to {artistName}</h1>
            <p className="text-xs text-zinc-400">by {decodedName}</p>
          </div>
        </div>

        <div className="space-y-4">
          {filteredRingtones.map(ringtone => (
            <RingtoneCard key={ringtone.id} ringtone={ringtone} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      {/* Header */}
      <header className="flex flex-col items-center gap-4 py-8 mb-6 border-b border-neutral-800">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border-2 border-emerald-500/30 relative">
          <User size={40} />
          <div className="absolute -bottom-2 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-700 flex items-center gap-1.5 shadow-lg">
            <Heart size={12} className="text-red-500 fill-red-500" />
            <span className="text-xs font-bold text-zinc-200">{totalLikes}</span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100">{decodedName}</h1>
          <p className="text-sm text-zinc-400 mt-1">Community Contributor</p>
        </div>
      </header>

      <div className="space-y-8">
        {/* Section 1: Their Favorites */}
        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Heart size={18} className="text-emerald-500" />
            Their Favorites
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {mockFavorites.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-neutral-800 relative">
                  <ImageWithFallback
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 text-center truncate w-full">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Contributions */}
        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Music size={18} className="text-emerald-500" />
            Contributions
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {contributions.slice(0, 10).map((artist, idx) => (
              <Link
                key={idx}
                href={`/user/${username}?artist=${encodeURIComponent(artist.name)}`}
                className="flex items-center justify-between p-4 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50 transition-colors group"
              >
                <span className="font-medium text-zinc-300 group-hover:text-emerald-400 transition-colors">
                  {artist.name}
                </span>
                <span className="text-xs text-zinc-500 bg-neutral-800 px-2 py-1 rounded-full group-hover:bg-neutral-700 transition-colors">
                  {artist.count} Uploads
                </span>
              </Link>
            ))}
            {contributions.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No contributions found.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
