import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import ProfileHeader from '@/components/ProfileHeader';
import SortControl from '@/components/SortControl';
import { POPULAR_ACTORS } from '@/lib/constants';

export default async function ActorPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ actor_name: string }>,
  searchParams: Promise<{ sort?: string }>
}) {
  const { actor_name } = await params;
  const { sort } = await searchParams;
  const actorName = decodeURIComponent(actor_name);
  
  let query = supabase
    .from('ringtones')
    .select('*')
    .ilike('cast', `%${actorName}%`);

  // Apply Sorting
  switch (sort) {
    case 'downloads':
      query = query.order('downloads', { ascending: false });
      break;
    case 'likes':
      query = query.order('likes', { ascending: false });
      break;
    case 'year_desc':
      query = query.order('movie_year', { ascending: false });
      break;
    case 'year_asc':
      query = query.order('movie_year', { ascending: true });
      break;
    default: // recent
      query = query.order('created_at', { ascending: false });
  }

  const { data: ringtones } = await query;

  // Try to find image from constants
  const actorImage = POPULAR_ACTORS.find(a => a.name === actorName)?.img;

  return (
    <div className="max-w-md mx-auto pb-24">
      <ProfileHeader 
        name={actorName} 
        type="Actor" 
        ringtoneCount={ringtones?.length || 0} 
        imageUrl={actorImage}
      />

      <SortControl />

      <div className="p-4 space-y-4">
        {ringtones && ringtones.length > 0 ? (
          ringtones.map(ringtone => (
            <RingtoneCard key={ringtone.id} ringtone={ringtone} />
          ))
        ) : (
          <div className="text-center py-12 text-zinc-500">
            <p>No ringtones found for this actor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
