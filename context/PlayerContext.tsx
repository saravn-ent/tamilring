'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Ringtone } from '@/types';

interface PlayerContextType {
  currentRingtone: Ringtone | null;
  isPlaying: boolean;
  playRingtone: (ringtone: Ringtone) => void;
  togglePlay: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentRingtone, setCurrentRingtone] = useState<Ringtone | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playRingtone = (ringtone: Ringtone) => {
    if (currentRingtone?.id === ringtone.id) {
      togglePlay();
    } else {
      setCurrentRingtone(ringtone);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <PlayerContext.Provider value={{ currentRingtone, isPlaying, playRingtone, togglePlay }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
