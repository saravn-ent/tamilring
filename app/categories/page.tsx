import { supabase } from '@/lib/supabaseClient';
import { unstable_cache } from 'next/cache';
import DiscoveryContainer from '@/components/DiscoveryContainer';

const getFeaturedArtists = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('ringtones')
      .select('singers, music_director, poster_url')
      .eq('status', 'approved')
      .limit(100);

    if (!data) return [];

    const artistsMap = new Map<string, { type: string, image: string }>();

    data.forEach(row => {
      // Music Directors
      if (row.music_director) {
        const md = row.music_director.trim();
        if (md && !artistsMap.has(md)) {
          artistsMap.set(md, { type: 'Director', image: row.poster_url || '' });
        }
      }
      // Singers
      if (row.singers) {
        row.singers.split(/,|&/).map((s: string) => s.trim()).forEach((s: string) => {
          if (s && !artistsMap.has(s)) {
            artistsMap.set(s, { type: 'Singer', image: row.poster_url || '' });
          }
        });
      }
    });

    // Convert to array and shuffle
    const allArtists = Array.from(artistsMap.entries()).map(([name, info]) => ({
      name,
      ...info
    }));

    // Simple shuffle
    for (let i = allArtists.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allArtists[i], allArtists[j]] = [allArtists[j], allArtists[i]];
    }

    return allArtists.slice(0, 9); // Return top 9 random
  },
  ['featured-artists-discovery'],
  { revalidate: 60 }
);

export default async function DiscoveryHub() {
  const featuredArtists = await getFeaturedArtists();

  return <DiscoveryContainer featuredArtists={featuredArtists} />;
}
