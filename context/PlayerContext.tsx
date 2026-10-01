'use client';

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { Ringtone } from '@/types';

interface PlayerContextType {
  currentRingtone: Ringtone | null;
  isPlaying: boolean;
  source: string | null;
  playRingtone: (ringtone: Ringtone, source?: string) => void;
  togglePlay: () => void;
  stopPlayer: () => void;
}

// Split contexts to prevent re-renders on progress updates
const PlayerStateContext = createContext<PlayerStateContextType | undefined>(undefined);
const PlayerProgressContext = createContext<PlayerProgressContextType | undefined>(undefined);

interface PlayerStateContextType {
  currentRingtone: Ringtone | null;
  isPlaying: boolean;
  source: string | null;
  playRingtone: (ringtone: Ringtone, source?: string) => void;
  togglePlay: () => void;
  stopPlayer: () => void;
}

interface PlayerProgressContextType {
  progress: number;
  duration: number;
  setProgress: (progress: number) => void;
  seek: (time: number) => void;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentRingtone, setCurrentRingtone] = useState<Ringtone | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentRingtone) return;

    // Only change src if it's different to avoid reloading
    if (audio.src !== currentRingtone.audio_url) {
      audio.src = currentRingtone.audio_url;
    }

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'AbortError') {
            console.error("Play failed", error);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [currentRingtone, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      // Throttle updates using requestAnimationFrame to avoid blocking
      requestAnimationFrame(() => {
        if (!audioRef.current) return;
        const { currentTime, duration: audioDuration } = audioRef.current;
        if (audioDuration) {
          setDuration(audioDuration);
          setProgress((currentTime / audioDuration) * 100);
        }
      });
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentRingtone(null);
    setSource(null);
  };

  const stopPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentRingtone(null);
    setSource(null);
    setProgress(0);
  };

  const playRingtone = (ringtone: Ringtone, playSource: string = 'general') => {
    setSource(playSource);
    if (currentRingtone?.id === ringtone.id) {
      if (!isPlaying) {
        setIsPlaying(true);
      }
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
    <PlayerStateContext.Provider value={{ currentRingtone, isPlaying, source, playRingtone, togglePlay, stopPlayer }}>
      <PlayerProgressContext.Provider value={{ progress, duration, setProgress, seek }}>
        {children}
        <audio
          ref={audioRef}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          className="hidden"
          preload="none"
          crossOrigin="anonymous"
        />
      </PlayerProgressContext.Provider>
    </PlayerStateContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerStateContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};

export const usePlayerProgress = () => {
  const context = useContext(PlayerProgressContext);
  if (!context) throw new Error('usePlayerProgress must be used within a PlayerProvider');
  return context;
};
