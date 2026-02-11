import { Suspense } from 'react';
import Link from 'next/link';
import { Heart, Music, Sparkles, ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import RingtoneCard from '@/components/RingtoneCard';
import { SectionSkeleton } from '@/components/skeletons';
// import SectionHeader from '@/components/SectionHeader';

// Use a fresh client for server component stability if needed, or reuse lib
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 3600; // Hourly update

async function ValentinesRingtones({ filter, label, icon: Icon, href }: { filter: string, label: string, icon: any, href?: string }) {
    // Simple fetch based on tag/mood
    const { data: ringtones } = await supabase
        .from('ringtones')
        .select('*')
        .eq('status', 'approved')
        .contains('tags', [filter]) // Array contains check
        .order('downloads', { ascending: false })
        .limit(8);

    if (!ringtones?.length) return null;

    return (
        <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between mb-3 mt-6">
                <h2 className="text-lg font-display font-bold text-black">{label}</h2>
                <Link href={href || `/search?q=${filter}`} className="text-xs text-brand-dark hover:text-brand-accent flex items-center hover:underline transition-colors font-medium">
                    View All <ArrowLeft size={14} className="ml-1 rotate-180" />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ringtones.map((r) => (
                    <RingtoneCard key={r.id} ringtone={r} />
                ))}
            </div>
        </div>
    );
}

export default function ValentinesPage() {
    return (
        <div className="min-h-screen bg-rose-50/30">

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-b-[3rem] shadow-xl mb-8">
                <div className="absolute inset-0 bg-[url('/patterns/hearts.png')] opacity-10"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-300/30 rounded-full blur-3xl"></div>

                <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-16 text-center">
                    <Link href="/" className="inline-flex items-center text-rose-100 hover:text-white mb-6 text-sm font-medium transition-colors bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                        <ArrowLeft size={14} className="mr-1" /> Back to Home
                    </Link>
                    <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-full mb-6">
                        <Heart className="w-8 h-8 text-rose-100 fill-rose-100 animate-pulse" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-sm">
                        Valentine's Special
                    </h1>
                    <p className="text-lg md:text-xl text-rose-100 max-w-lg mx-auto font-medium">
                        Celebrate love with our handpicked collection of romantic ringtones and melodies.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-20">

                {/* Main Content */}
                <Suspense fallback={<SectionSkeleton type="grid" />}>
                    <ValentinesRingtones filter="Love" label="Top Romantic Hits" icon={Heart} href="/mood/Love" />
                </Suspense>

                <Suspense fallback={<SectionSkeleton type="grid" />}>
                    <ValentinesRingtones filter="Melody" label="Soulful Melodies" icon={Music} href="/mood/Melody" />
                </Suspense>

                <Suspense fallback={<SectionSkeleton type="grid" />}>
                    <ValentinesRingtones filter="BGM" label="Love BGMs" icon={Sparkles} href="/category/bgm" />
                </Suspense>

                <div className="mt-12 p-8 bg-white rounded-3xl text-center border border-rose-100 shadow-sm">
                    <h3 className="text-2xl font-bold text-zinc-800 mb-2">Looking for something specific?</h3>
                    <p className="text-zinc-500 mb-6">Search for your favorite movie or artist.</p>
                    <Link
                        href="/search"
                        className="inline-flex items-center justify-center px-6 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-transform active:scale-95"
                    >
                        Search Ringtones
                    </Link>
                </div>

            </div>
        </div>
    );
}
