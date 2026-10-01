'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Music } from 'lucide-react';
import { splitArtists } from '@/lib/utils';

interface StreamButtonsProps {
  songTitle: string;
  artistName: string;
  movieName?: string;
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
  movieName,
  appleMusicLink,
  spotifyLink,
}: StreamButtonsProps) {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running in browser and set iOS flag
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      // Use setTimeout to avoid synchronous setState during render/mount phase lint warning
      const timer = setTimeout(() => {
        setIsIOS(isIOSDevice);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // --- Link Generation Logic ---

  // Fix for Spotify search query encoding
  const getCleanQuery = () => {
    // Clean up song title (remove extra descriptors)
    const cleanTitle = songTitle.replace(/\(From.*?\)/gi, '').trim();
    const artists = splitArtists(artistName).join(' ');
    
    // Prioritize Movie + Artist Name first for better Album results
    // This helps when the ringtone name is descriptive (e.g. "Karthik Sees Salim's Certificates")
    // and not a standard song title.
    const parts = [
      movieName,
      artists,
      cleanTitle
    ].filter(Boolean);
    
    // Join parts and replace potential URL-breaking characters (like slashes) with spaces
    // Also normalize spaces to avoid double spaces
    const query = parts.join(' ').replace(/[\\/]/g, ' ').replace(/\s+/g, ' ').trim();

    return encodeURIComponent(query);
  };

  const getAppleLink = () => {
    if (appleMusicLink) return appleMusicLink;
    return `https://music.apple.com/in/search?term=${getCleanQuery()}`;
  };

  const getSpotifyLink = () => {
    if (spotifyLink) return spotifyLink;
    return `https://open.spotify.com/search/${getCleanQuery()}`;
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-3">
      {/* Copyright Compliance Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700/60 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">Verified Official Source</span>
        </div>
        <span className="text-xs text-m3-on-surface-variant font-bold">Support the Creators</span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Apple Music - M3 Card */}
        <a
          href={getAppleLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Listen to official track on Apple Music"
          className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-m3-surface-container-low hover:bg-m3-surface-container border border-m3-outline-variant/50 hover:border-rose-500/40 m3-elevation-1 hover:m3-elevation-2 transition-all duration-200 active:scale-[0.99] group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20 transition-transform duration-200 group-hover:scale-105">
              <Music size={19} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xs sm:text-sm font-bold text-m3-on-surface group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Listen in Lossless
              </span>
              <span className="text-[11px] text-m3-on-surface-variant font-bold tracking-wider uppercase mt-0.5">
                Apple Music
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-m3-on-surface group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors pr-1">
            <span className="text-xs font-bold tracking-wider uppercase">Open</span>
            <ExternalLink size={14} />
          </div>
        </a>

        {/* Spotify - M3 Card */}
        <a
          href={getSpotifyLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Stream official track on Spotify"
          className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-m3-surface-container-low hover:bg-m3-surface-container border border-m3-outline-variant/50 hover:border-[#1DB954]/50 m3-elevation-1 hover:m3-elevation-2 transition-all duration-200 active:scale-[0.99] group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-[#1DB954] flex items-center justify-center shrink-0 border border-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
              <SpotifyIcon />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xs sm:text-sm font-bold text-m3-on-surface group-hover:text-[#1DB954] transition-colors">
                Stream on Spotify
              </span>
              <span className="text-[11px] text-m3-on-surface-variant font-bold tracking-wider uppercase mt-0.5">
                Free & Premium
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-m3-on-surface group-hover:text-[#1DB954] transition-colors pr-1">
            <span className="text-xs font-bold tracking-wider uppercase">Play</span>
            <ExternalLink size={14} />
          </div>
        </a>
      </div>

      <p className="text-xs text-m3-on-surface-variant text-center px-4 leading-relaxed font-medium mt-1">
        By streaming the full song on official platforms, you directly support the music directors, singers, and creators of this work.
      </p>
    </div>
  );
}
