'use client';

import { usePlayer } from '@/context/PlayerContext';
import { Play, Pause, Download } from 'lucide-react';
import { useRef, useEffect } from 'react';

export default function StickyPlayer() {
  const { currentRingtone, isPlaying, togglePlay } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentRingtone && audioRef.current) {
      // Only change src if it's different to avoid reloading
      if (audioRef.current.src !== currentRingtone.audio_url) {
        audioRef.current.src = currentRingtone.audio_url;
      }
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentRingtone, isPlaying]);

  if (!currentRingtone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 p-4 pb-8 md:pb-4 transition-transform duration-300 translate-y-0 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      {/* Waveform Background (Mock) */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: `url(${currentRingtone.waveform_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className="max-w-md mx-auto flex items-center gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-zinc-100 font-bold truncate">{currentRingtone.title}</p>
          <p className="text-zinc-400 text-xs truncate">{currentRingtone.movie_name}</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-neutral-900 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
          </button>
          
          <a 
            href={currentRingtone.audio_url} 
            download 
            className="p-3 rounded-full bg-neutral-800 text-zinc-100 hover:bg-neutral-700 transition-colors"
          >
            <Download size={20} />
          </a>
        </div>
      </div>
      
      <audio ref={audioRef} onEnded={() => togglePlay()} className="hidden" />
    </div>
  );
}
