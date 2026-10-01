import { supabase } from '@/lib/supabaseClient';
import { searchPerson, getImageUrl } from '@/lib/tmdb';
import RingtoneCard from '@/components/RingtoneCard';
import { Clapperboard } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import { Metadata } from 'next';
import {
  generateArtistMetadata,
  generatePersonSchema,
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateItemListSchema,
  combineSchemas
} from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ director_name: string }> }): Promise<Metadata> {
  const { director_name } = await params;
  const directorName = decodeURIComponent(director_name);
  return generateArtistMetadata({ name: directorName, role: 'movie_director' });
}

export default async function DirectorPage({ params }: { params: Promise<{ director_name: string }> }) {
  const { director_name } = await params;
  const directorName = decodeURIComponent(director_name);

  const { data: ringtones } = await supabase
    .from('ringtones')
    .select('*')
    .eq('status', 'approved')
    .ilike('movie_director', `%${directorName}%`)
    .order('downloads', { ascending: false });

  // Fetch director image from TMDB
  const person = await searchPerson(directorName);
  const directorImage = person?.profile_path ? getImageUrl(person.profile_path, 'w185') : null;

  // --- Structured Data ---
  const personSchema = generatePersonSchema({
    name: directorName,
    image_url: directorImage || undefined,
    role: 'movie_director',
    description: `Tamil Movie Director known for ${ringtones?.slice(0, 3).map(r => r.movie_name).filter(Boolean).join(', ') || 'Tamil Cinema'}.`,
    url: `/director/${encodeURIComponent(directorName)}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Directors', url: '/categories' },
    { name: directorName, url: `/director/${encodeURIComponent(directorName)}` },
  ]);

  const collectionPageSchema = generateCollectionPageSchema({
    name: `${directorName} Tamil Movie Ringtones`,
    description: `Download Tamil movie ringtones from films directed by ${directorName}. High-quality BGM and songs for Android and iPhone.`,
    url: `/director/${encodeURIComponent(directorName)}`,
    numberOfItems: ringtones?.length || 0,
  });

  const itemListSchema = ringtones?.length ? generateItemListSchema({
    name: `${directorName} Movie Ringtones`,
    description: `Download Tamil movie ringtones from films directed by ${directorName}. Free download for Android and iPhone.`,
    items: ringtones.slice(0, 10).map(r => ({
      title: r.title,
      slug: r.slug,
      artwork_url: r.poster_url || directorImage || undefined,
    })),
  }) : null;

  const combinedSchema = itemListSchema
    ? combineSchemas(personSchema, collectionPageSchema, itemListSchema, breadcrumbSchema)
    : combineSchemas(personSchema, collectionPageSchema, breadcrumbSchema);

  return (
    <div className="max-w-md mx-auto">
      <StructuredData data={combinedSchema} />

      <div className="relative p-8 flex flex-col items-center justify-center bg-neutral-800/30 border-b border-neutral-800">
        {/* Favorite Button */}
        <div className="absolute top-4 right-4">
          <FavoriteButton
            item={{
              id: directorName,
              name: directorName,
              type: 'Director',
              href: `/director/${encodeURIComponent(directorName)}`
            }}
            className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700"
          />
        </div>

        {directorImage ? (
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-emerald-500/20 shadow-lg">
            <img src={directorImage} alt={directorName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
            <Clapperboard size={40} />
          </div>
        )}
        <h1 className="text-2xl font-bold text-white text-center">{directorName}</h1>
        <p className="text-zinc-400 text-sm mt-1">Movie Director • {ringtones?.length || 0} Ringtones</p>
      </div>

      <div className="px-4 py-6">
        {ringtones && ringtones.length > 0 ? (
          <div className="space-y-4">
            {ringtones.map((ringtone) => (
              <RingtoneCard key={ringtone.id} ringtone={ringtone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            No ringtones found for this director.
          </div>
        )}
      </div>
    </div>
  );
}
