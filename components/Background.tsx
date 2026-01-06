'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Background() {
  const pathname = usePathname();
  const [colors, setColors] = useState({
    orb1: 'bg-purple-900/20',
    orb2: 'bg-emerald-900/10',
    orb3: 'bg-blue-900/10'
  });

  useEffect(() => {
    // Decode pathname to handle URL encoded characters
    const path = decodeURIComponent(pathname).toLowerCase();

    if (path.includes('mass') || path.includes('action') || path.includes('kuthu')) {
      setColors({
        orb1: 'bg-red-900/30',
        orb2: 'bg-orange-900/20',
        orb3: 'bg-amber-900/20'
      });
    } else if (path.includes('melody') || path.includes('love') || path.includes('romantic')) {
      setColors({
        orb1: 'bg-pink-900/30',
        orb2: 'bg-rose-900/20',
        orb3: 'bg-cyan-900/20'
      });
    } else if (path.includes('sad') || path.includes('emotional')) {
      setColors({
        orb1: 'bg-blue-900/30',
        orb2: 'bg-indigo-900/20',
        orb3: 'bg-slate-900/20'
      });
    } else if (path.includes('bgm') || path.includes('instrumental')) {
      setColors({
        orb1: 'bg-emerald-900/30',
        orb2: 'bg-teal-900/20',
        orb3: 'bg-cyan-900/20'
      });
    } else {
      // Default
      setColors({
        orb1: 'bg-purple-900/20',
        orb2: 'bg-emerald-900/10',
        orb3: 'bg-blue-900/10'
      });
    }
  }, [pathname]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden transition-colors duration-1000 dark:opacity-100 opacity-0">
      {/* Noise Texture - Removed for performance on mobile
       <div 
         className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
         style={{ ... }}
       />
      */}

      {/* Aurora Orbs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] animate-aurora-1 mix-blend-screen transition-colors duration-1000 will-change-transform ${colors.orb1}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] animate-aurora-2 mix-blend-screen transition-colors duration-1000 will-change-transform ${colors.orb2}`}></div>
      <div className={`absolute top-[30%] left-[20%] w-[70vw] h-[70vw] rounded-full blur-[120px] animate-aurora-3 mix-blend-screen transition-colors duration-1000 will-change-transform ${colors.orb3}`}></div>
    </div>
  );
}
