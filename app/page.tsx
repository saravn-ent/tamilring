import { supabase } from '@/lib/supabaseClient';
import { Ringtone } from '@/types';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import ClientFeed from '@/components/ClientFeed';

export const revalidate = 0;

export default async function Home() {
  const { data: ringtones } = await supabase
    .from('ringtones')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-zinc-100">TamilRing</h1>
        <Link href="/upload" className="p-2 bg-neutral-800 rounded-full text-emerald-500 hover:bg-neutral-700">
          <Upload size={20} />
        </Link>
      </header>

      <ClientFeed ringtones={ringtones as Ringtone[] || []} />
    </div>
  );
}
