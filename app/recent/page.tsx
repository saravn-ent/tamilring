import { supabase } from '@/lib/supabaseClient';
import RingtoneCard from '@/components/RingtoneCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function RecentPage() {
  const { data: recent } = await supabase
    .from('ringtones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      <header className="flex items-center gap-4 py-4 mb-6">
        <Link href="/" className="p-2 bg-neutral-800 rounded-full text-zinc-400 hover:text-zinc-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-zinc-100">Just Added</h1>
      </header>

      <div className="space-y-4">
        {recent?.map(ringtone => (
          <RingtoneCard key={ringtone.id} ringtone={ringtone} />
        ))}
      </div>
    </div>
  );
}
