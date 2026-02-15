'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Music } from 'lucide-react';

interface StreamButtonsProps {
  songTitle: string;
  artistName: string;
  appleMusicLink?: string;
  spotifyLink?: string;
}

// --- Icons (SVG) ---

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59 14.42c-.18.3-.56.4-.86.22-2.36-1.44-5.33-1.76-8.83-.96-.34.08-.68-.14-.76-.48-.08-.34.14-.68.48-.76 3.86-.88 7.18-.52 9.84 1.1.3.18.4.56.22.86zm1.23-2.74c-.23.37-.72.49-1.09.26-2.7-1.66-6.81-2.14-9.99-1.17-.42.13-.87-.1-.99-.52-.13-.42.1-.87.52-.99 3.62-1.1 8.18-.57 11.29 1.34.37.23.49.72.26 1.09zm.11-2.86C14.7 8.68 8.54 8.46 4.97 9.54c-.5.15-1.03-.14-1.18-.64-.15-.5.14-1.03.64-1.18 4.13-1.25 10.93-.99 14.62 1.2.45.27.6.86.33 1.31-.26.45-.85.6-1.3.33z" />
  </svg>
);

export default function StreamButtons({
  songTitle,
  artistName,
  appleMusicLink,
  spotifyLink,
}: StreamButtonsProps) {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Simple iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  // --- Link Generation Logic ---

  const getAppleLink = () => {
    if (appleMusicLink) return appleMusicLink;
    const query = encodeURIComponent(`${songTitle} ${artistName}`);
    return `https://music.apple.com/in/search?term=${query}`;
  };

  const getSpotifyLink = () => {
    if (spotifyLink) return spotifyLink;
    const query = encodeURIComponent(`${songTitle} ${artistName}`);
    return `https://open.spotify.com/search/${query}`;
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-3">
      {/* Copyright Compliance Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 shadow-sm">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-tight">Verified Official Source</span>
        </div>
        <span className="text-[10px] text-zinc-400 font-medium">Support the Creators</span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Apple Music - Primary */}
        <a
          href={getAppleLink()}
          target="_blank"
          rel="noopener noreferrer"
          className={`
          flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all group
          ${isIOS
              ? 'bg-linear-to-r from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-500/20 scale-[1.02]'
              : 'bg-[#000000] text-white hover:bg-zinc-900 border border-zinc-800'
            }
        `}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isIOS ? 'bg-white/20' : 'bg-zinc-800'}`}>
              <Music size={18} className={isIOS ? 'text-white' : 'text-rose-500'} />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-black">Listen in Lossless</span>
              <span className="text-[10px] opacity-70 font-semibold tracking-wide uppercase">Apple Music</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold">OPEN</span>
            <ExternalLink size={14} />
          </div>
        </a>

        {/* Spotify - Secondary */}
        <a
          href={getSpotifyLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="
          flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all group
          bg-white text-brand-dark border-2 border-zinc-100 hover:border-[#1DB954]/30 hover:shadow-lg hover:shadow-green-500/5
        "
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <div className="text-[#1DB954]">
                <SpotifyIcon />
              </div>
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-black text-zinc-900">Stream on Spotify</span>
              <span className="text-[10px] text-zinc-500 font-semibold tracking-wide uppercase">Free & Premium</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity text-zinc-500">
            <span className="text-[10px] font-bold">PLAY</span>
            <ExternalLink size={14} />
          </div>
        </a>
      </div>

      <p className="text-[9px] text-zinc-400 text-center px-4 leading-relaxed font-medium mt-1">
        By streaming the full song on official platforms, you directly support the music directors, singers, and creators of this work.
      </p>
    </div>
  );
}
