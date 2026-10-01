'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { usePlayer } from '@/context/PlayerContext';
import { usePathname } from 'next/navigation';

export default function BackToTop() {
    const [show, setShow] = useState(false);
    const { currentRingtone, source } = usePlayer();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setShow(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        hapticFeedback(hapticPatterns.selection);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!show) return null;

    const isPlayerVisible = Boolean(
        currentRingtone && 
        source !== 'spotlight' && 
        !pathname?.startsWith('/ringtone/')
    );

    return (
        <button
            onClick={scrollToTop}
            className={`fixed right-4 z-50 w-10 h-10 bg-m3-primary-container text-m3-on-primary-container rounded-2xl m3-elevation-2 hover:m3-elevation-3 shadow-md md:hidden active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer ${
                isPlayerVisible ? 'bottom-32' : 'bottom-18'
            }`}
            aria-label="Back to top"
        >
            <ArrowUp size={20} />
        </button>
    );
}

