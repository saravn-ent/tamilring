import { Suspense } from 'react';
import Link from 'next/link';
import { Heart, Music, Sparkles, ArrowLeft, Star, PlayCircle, Quote } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { SectionSkeleton } from '@/components/skeletons';
import TMDBImage from '@/components/TMDBImage';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 3600;

const CURATED_MOVIES = [
    { name: "Moondram Pirai", quote: "A tragic, beautiful tale of innocent hearts.", rating: 8.6 },
    { name: "Mouna Ragam", quote: "Discovering melody in the silence of life.", rating: 8.6 },
    { name: "96", quote: "A nostalgic ride back to first love.", rating: 8.5 },
    { name: "Alaipayuthey", quote: "The magic found in new beginnings.", rating: 8.3 },
    { name: "Roja", quote: "A love that stands tall against all odds.", rating: 8.2 },
    { name: "Vaaranam Aayiram", quote: "Finding strength through the memory of love.", rating: 8.2 },
    { name: "Thulladha Manamum Thullum", quote: "A selfless love that speaks through silence.", rating: 8.2 },
    { name: "Bombay", quote: "A love that transcends boundaries and borders.", rating: 8.1 },
    { name: "Vinnaithaandi Varuvaayaa", quote: "A soul-stirring journey of unrequited love.", rating: 8.1 },
    { name: "Kadhalukku Mariyadhai", quote: "Respect as the cornerstone of true love.", rating: 8.1 },
    { name: "Kaadhal", quote: "The raw, honest intensity of young hearts.", rating: 8.0 },
    { name: "Kandukondain Kandukondain", quote: "The poetic rhythm of finding one's soulmate.", rating: 7.8 },
    { name: "Minnale", quote: "The rainy romance that defined a generation.", rating: 7.7 },
    { name: "O Kadhal Kanmani", quote: "A modern pulse on urban love and heartbeats.", rating: 7.4 },
    { name: "Kushi", quote: "The playful, ego-clashing comedy of love.", rating: 7.4 },
    { name: "3", quote: "A deep, haunting exploration of emotional bonds.", rating: 7.3 },
    { name: "Madrasapattinam", quote: "An eternal bond from a bygone era.", rating: 7.3 },
    { name: "Sillunu Oru Kaadhal", quote: "A refreshing breeze of enduring affection.", rating: 7.2 },
    { name: "Neethaane En Ponvasantham", quote: "A rhythmic journey through the seasons of love.", rating: 6.0 }
];

function ValentinesMovieCard({
    movieName,
    quote,
    index,
    movieData
}: {
    movieName: string,
    quote: string,
    index: number,
    movieData: { poster_url: string | null, movie_year: string | null }
}) {
    if (!movieData) return null;

    return (
        <Link
            href={`/movie/${encodeURIComponent(movieName)}`}
            className="group relative flex flex-col md:flex-row gap-8 items-center bg-white/40 backdrop-blur-3xl rounded-[3rem] p-6 border border-rose-200/50 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.1)] transition-all duration-700 hover:shadow-rose-500/20 hover:-translate-y-2"
        >
            <div className="relative w-full md:w-56 aspect-[2/3] shrink-0 rounded-[2rem] overflow-hidden shadow-2xl">
                <TMDBImage
                    path={movieData.poster_url}
                    alt={movieName}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 250px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 to-transparent" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-rose-100">
                        <PlayCircle className="w-6 h-6 text-rose-500" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 py-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <span className="w-8 h-px bg-rose-200" />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-rose-400/60">Story {index + 1}</span>
                </div>

                <h3 className="text-3xl md:text-5xl font-black text-rose-950 mb-4 tracking-tight leading-none group-hover:text-rose-600 transition-colors">
                    {movieName}
                </h3>

                <div className="relative inline-block mb-6 md:mb-8">
                    <Quote className="absolute -left-4 -top-3 w-6 h-6 text-rose-100 fill-rose-100 -rotate-12" />
                    <p className="text-lg md:text-xl font-medium text-rose-800/70 italic leading-relaxed px-2">
                        {quote}
                    </p>
                </div>

                <div className="mt-auto flex items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full text-rose-500 font-bold text-xs border border-rose-100">
                        <Music size={12} fill="currentColor" />
                        Explore Theme
                    </div>
                    <span className="text-rose-200 font-black text-sm">{movieData.movie_year}</span>
                </div>
            </div>
        </Link>
    );
}

function PetalFall() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-float opacity-0 rotate-12"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-10%`,
                        '--delay': `${Math.random() * 20}s`,
                        '--duration': `${10 + Math.random() * 15}s`,
                        fontSize: `${10 + Math.random() * 20}px`,
                        color: `rgba(244, 63, 94, ${0.1 + Math.random() * 0.2})`,
                        transform: `rotate(${Math.random() * 360}deg)`
                    } as any}
                >
                    <div className="w-4 h-6 bg-rose-200/40 rounded-full blur-[1px] rotate-45" />
                </div>
            ))}
        </div>
    );
}

export default async function ValentinesPage() {
    // Pre-fetch all movie data to ensure sequential numbering for visible items
    const moviesWithData = await Promise.all(
        CURATED_MOVIES.map(async (movie) => {
            const { data } = await supabase
                .from('ringtones')
                .select('poster_url, movie_year')
                .eq('status', 'approved')
                .eq('movie_name', movie.name)
                .limit(1)
                .maybeSingle();

            return data ? { ...movie, poster_url: data.poster_url, movie_year: data.movie_year } : null;
        })
    );

    const filteredMovies = moviesWithData.filter((m): m is NonNullable<typeof m> => m !== null);

    return (
        <div className="min-h-screen relative bg-[#fffafb] selection:bg-rose-100 text-[#2d0a12]">
            {/* Background Aesthetic */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#fff,_#fff5f6,_#ffe4e9)]" />
                <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-pink-100/50 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] left-[5%] w-[30%] h-[30%] bg-rose-50 blur-[100px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />
            </div>

            <PetalFall />

            {/* Vertical Navigation Bar */}
            <div className="fixed top-24 left-8 hidden lg:flex flex-col items-center gap-12 z-50">
                <div className="h-24 w-px bg-rose-200" />
                <span className="rotate-90 origin-center text-[10px] font-black tracking-[0.5em] uppercase text-rose-300">Valentines_2026</span>
                <div className="h-24 w-px bg-rose-200" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-48">

                <header className="mb-32 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-rose-400 hover:text-rose-600 mb-16 text-xs font-bold tracking-[0.3em] uppercase transition-all bg-white px-8 py-3 rounded-full border border-rose-100 shadow-sm hover:translate-x-1"
                    >
                        <ArrowLeft size={16} className="mr-3" /> Return to Gallery
                    </Link>

                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-4 text-rose-200">
                            <Star size={16} fill="currentColor" />
                            <Star size={24} fill="currentColor" />
                            <Star size={16} fill="currentColor" />
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black tracking-tight text-rose-950 leading-none">
                            The Music <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-400">of Hearts.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-rose-900/40 font-medium max-w-2xl mx-auto italic">
                            A hand-picked collection of stories that move us.
                        </p>
                    </div>
                </header>

                {/* Vertical Story Layout */}
                <div className="flex flex-col gap-12 md:gap-20 mb-32">
                    {filteredMovies.map((movie, idx) => (
                        <ValentinesMovieCard
                            key={movie.name}
                            movieName={movie.name}
                            quote={movie.quote}
                            index={idx}
                            movieData={{ poster_url: movie.poster_url, movie_year: movie.movie_year }}
                        />
                    ))}
                </div>

                {/* Final Chapter */}
                <footer className="relative mt-64 py-24 text-center bg-rose-950 rounded-[4rem] text-white shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20" />
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

                    <div className="relative z-10 px-8">
                        <Sparkles className="w-12 h-12 text-rose-400 mx-auto mb-8 animate-pulse" />
                        <h3 className="text-4xl md:text-6xl font-black mb-12 tracking-tight">The Library of Memories.</h3>
                        <p className="text-rose-100/60 mb-16 max-w-xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
                            Every great movie has a sound. Find yours in our full collection.
                        </p>

                        <Link
                            href="/search"
                            className="inline-flex items-center justify-center px-12 py-5 bg-white text-rose-950 text-lg font-black rounded-3xl hover:bg-rose-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95 group uppercase tracking-widest"
                        >
                            Open the Archives
                            <Heart className="ml-4 w-5 h-5 group-hover:fill-rose-500 group-hover:text-rose-500 transition-colors" />
                        </Link>
                    </div>
                </footer>
            </div>

            {/* Background Watermark */}
            <div className="fixed -bottom-10 left-10 text-[20rem] font-black text-rose-500/[0.03] pointer-events-none select-none z-0">
                L_O_V_E
            </div>
        </div>
    );
}
