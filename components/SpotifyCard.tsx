import Image from 'next/image';
import { Ringtone } from '@/types';

interface SpotifyCardProps {
    ringtone: Ringtone;
    className?: string;
}

export default function SpotifyCard({ ringtone, className = '' }: SpotifyCardProps) {
    const cleanTitle = ringtone.title.replace(/\(From ".*?"\)/i, '').trim();

    return (
        <div className={`relative aspect-[9/16] w-full max-w-sm bg-black rounded-3xl overflow-hidden shadow-2xl ${className}`}>
            {/* Background Layer - heavily blurred */}
            <div className="absolute inset-0 z-0">
                {ringtone.poster_url && (
                    <Image
                        src={ringtone.poster_url}
                        alt="Background"
                        fill
                        className="object-cover blur-xl opacity-60 scale-150"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90" />
            </div>

            {/* Content Layer - Centered and Compact (approx 35% visual weight) */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">

                {/* Album Art - Smaller (matches ~33% width of video canvas) */}
                <div className="relative w-32 h-44 rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 rotate-2 hover:rotate-0 transition-transform duration-500 ease-out mb-3">
                    {ringtone.poster_url ? (
                        <Image
                            src={ringtone.poster_url}
                            alt={ringtone.movie_name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                            <span className="text-4xl">🎵</span>
                        </div>
                    )}
                </div>

                {/* Typography */}
                <div className="space-y-1 max-w-[85%]">
                    <h1 className="text-base font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                        {cleanTitle}
                    </h1>

                    {/* Movie Name & Year */}
                    <p className="text-[10px] text-white/90 font-medium">
                        {ringtone.movie_name} <span className="text-white/60">({ringtone.movie_year})</span>
                    </p>

                    <p className="text-[9px] text-emerald-400 font-medium uppercase tracking-widest pt-3">
                        TamilRing.in
                    </p>
                </div>
            </div>
        </div>
    );
}
