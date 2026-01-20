'use client';

import { usePathname } from 'next/navigation';

export default function Background() {
  const pathname = usePathname();
  // Decode pathname to handle URL encoded characters
  const path = decodeURIComponent(pathname).toLowerCase();

  let orb1 = 'bg-purple-900/20';
  let orb2 = 'bg-emerald-900/10';
  let orb3 = 'bg-blue-900/10';

  if (path.includes('mass') || path.includes('action') || path.includes('kuthu')) {
    orb1 = 'bg-red-900/30';
    orb2 = 'bg-orange-900/20';
    orb3 = 'bg-amber-900/20';
  } else if (path.includes('melody') || path.includes('love') || path.includes('romantic')) {
    orb1 = 'bg-pink-900/30';
    orb2 = 'bg-rose-900/20';
    orb3 = 'bg-cyan-900/20';
  } else if (path.includes('sad') || path.includes('emotional')) {
    orb1 = 'bg-blue-900/30';
    orb2 = 'bg-indigo-900/20';
    orb3 = 'bg-slate-900/20';
  } else if (path.includes('bgm') || path.includes('instrumental')) {
    orb1 = 'bg-emerald-900/30';
    orb2 = 'bg-teal-900/20';
    orb3 = 'bg-cyan-900/20';
  }

  const colors = { orb1, orb2, orb3 };

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
