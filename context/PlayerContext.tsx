'use client';

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { Ringtone } from '@/types';

interface PlayerContextType {
  currentRingtone: Ringtone | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playRingtone: (ringtone: Ringtone) => void;
  togglePlay: () => void;
  setProgress: (progress: number) => void;
  seek: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentRingtone, setCurrentRingtone] = useState<Ringtone | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
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
      const { currentTime, duration: audioDuration } = audioRef.current;
      if (audioDuration) {
        setDuration(audioDuration);
        setProgress((currentTime / audioDuration) * 100);
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

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress((time / duration) * 100);
    }
  };

  return (
    <PlayerContext.Provider value={{ currentRingtone, isPlaying, progress, duration, playRingtone, togglePlay, setProgress, seek }}>
      {children}
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
        preload="none"
        crossOrigin="anonymous"
      />
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
