'use client';

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { Ringtone } from '@/types';

interface PlayerContextType {
  currentRingtone: Ringtone | null;
  isPlaying: boolean;
  progress: number;
  playRingtone: (ringtone: Ringtone) => void;
  togglePlay: () => void;
  setProgress: (progress: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentRingtone, setCurrentRingtone] = useState<Ringtone | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentRingtone && audioRef.current) {
      // Only change src if it's different to avoid reloading
      if (audioRef.current.src !== currentRingtone.audio_url) {
        audioRef.current.src = currentRingtone.audio_url;
        setProgress(0);
      }
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentRingtone, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      if (duration) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const playRingtone = (ringtone: Ringtone) => {
    if (currentRingtone?.id === ringtone.id) {
      togglePlay();
    } else {
      setCurrentRingtone(ringtone);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <PlayerContext.Provider value={{ currentRingtone, isPlaying, progress, playRingtone, togglePlay, setProgress }}>
      {children}
      <audio 
        ref={audioRef} 
        onEnded={handleEnded} 
        onTimeUpdate={handleTimeUpdate}
        className="hidden" 
      />
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
