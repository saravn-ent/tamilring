'use client';

import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface WhatsAppShareProps {
    title: string;
    movie: string;
    slug: string;
}

export default function WhatsAppShare({ title, movie, slug }: WhatsAppShareProps) {
    const { language } = useLanguage();

    const shareToWhatsApp = () => {
        const url = `${window.location.origin}/ringtone/${slug}`;
        const englishText = `🎵 Download ${title} (${movie}) ringtone from TamilRing!\n\nDownload Link: ${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(englishText)}`;

        window.open(whatsappUrl, '_blank');
    };

    return (
        <button
            onClick={shareToWhatsApp}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20"
        >
            <MessageCircle size={20} fill="currentColor" />
            <span>Share on WhatsApp Status</span>
        </button>
    );
}
