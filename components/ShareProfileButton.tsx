'use client';
import { Share2 } from 'lucide-react';

export default function ShareProfileButton({ userId, name }: { userId: string, name: string }) {
    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${name} on TamilRing`,
                    text: `Check out ${name}'s ringtone collection on TamilRing!`,
                    url,
                });
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(url);
            alert('Profile link copied to clipboard!');
        }
    };

    return (
        <button
            onClick={handleShare}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            title="Share Profile"
        >
            <Share2 size={20} />
        </button>
    );
}
