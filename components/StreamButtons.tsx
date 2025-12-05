'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Music } from 'lucide-react';

interface StreamButtonsProps {
  songTitle: string;
  artistName: string;
  appleMusicLink?: string;
  spotifyLink?: string;
}

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
    
    // Fallback search
    const query = encodeURIComponent(`${songTitle} ${artistName}`);
    return `https://music.apple.com/in/search?term=${query}`;
  };

  const getSpotifyLink = () => {
    if (spotifyLink) return spotifyLink;
    
    // Web Fallback Search
    const query = encodeURIComponent(`${songTitle} ${artistName}`);
    return `https://open.spotify.com/search/${query}`;
  };

  // --- Icons (SVG) ---
  
  const SpotifyIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59 14.42c-.18.3-.56.4-.86.22-2.36-1.44-5.33-1.76-8.83-.96-.34.08-.68-.14-.76-.48-.08-.34.14-.68.48-.76 3.86-.88 7.18-.52 9.84 1.1.3.18.4.56.22.86zm1.23-2.74c-.23.37-.72.49-1.09.26-2.7-1.66-6.81-2.14-9.99-1.17-.42.13-.87-.1-.99-.52-.13-.42.1-.87.52-.99 3.62-1.1 8.18-.57 11.29 1.34.37.23.49.72.26 1.09zm.11-2.86C14.7 8.68 8.54 8.46 4.97 9.54c-.5.15-1.03-.14-1.18-.64-.15-.5.14-1.03.64-1.18 4.13-1.25 10.93-.99 14.62 1.2.45.27.6.86.33 1.31-.26.45-.85.6-1.3.33z" />
    </svg>
  );

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {/* Apple Music - Primary */}
      <a
        href={getAppleLink()}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all
          ${isIOS 
            ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20 scale-105' 
            : 'bg-[#FA243C] text-white hover:bg-[#d41c30]'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <Music size={20} />
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm">Play High Quality</span>
            <span className="text-[10px] opacity-80 font-medium">on Apple Music</span>
          </div>
        </div>
        <ExternalLink size={16} className="opacity-60" />
      </a>

      {/* Spotify - Secondary */}
      <a
        href={getSpotifyLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="
          flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all
          bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20 hover:bg-[#1DB954]/20
        "
      >
        <div className="flex items-center gap-3">
          <SpotifyIcon />
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm">Listen for Free</span>
            <span className="text-[10px] opacity-80 font-medium">on Spotify</span>
          </div>
        </div>
        <ExternalLink size={16} className="opacity-60" />
      </a>
    </div>
  );
}
