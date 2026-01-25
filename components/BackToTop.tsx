'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { hapticFeedback } from '@/lib/haptics';

export default function BackToTop() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShow(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        hapticFeedback(20);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!show) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 z-50 p-3 bg-white border border-brand-gray text-brand-blue rounded-full shadow-lg shadow-brand-dark/10 animate-in fade-in zoom-in duration-300 md:hidden active:scale-95 transition-transform"
            aria-label="Back to top"
        >
            <ArrowUp size={24} strokeWidth={2.5} />
        </button>
    );
}
