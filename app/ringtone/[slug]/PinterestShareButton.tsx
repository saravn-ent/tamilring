'use client';

import { Ringtone } from "@/types";
import { getImageUrl } from "@/lib/tmdb";

interface PinterestShareButtonProps {
    ringtone: Ringtone;
}

export default function PinterestShareButton({ ringtone }: PinterestShareButtonProps) {
    const shareOnPinterest = () => {
        const url = window.location.href;
        const media = getImageUrl(ringtone.poster_url || ringtone.backdrop_url || null);
        const description = `Download ${ringtone.title} Ringtone from ${ringtone.movie_name || 'TamilRing'}. #TamilRingtones #BGM`;

        // Pinterest URL format
        const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media || '')}&description=${encodeURIComponent(description)}`;

        window.open(pinterestUrl, '_blank', 'width=750,height=500');
    };

    return (
        <button
            onClick={shareOnPinterest}
            className="inline-flex items-center gap-2 text-[#E60023] hover:text-white bg-white hover:bg-[#E60023] border border-[#E60023]/20 px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 group"
            title="Save to Pinterest"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="transition-colors"
            >
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949.002-2.098.216-3.003l1.55-6.567s-.406-.822-.406-2.031c0-1.907 1.106-3.328 2.483-3.328 1.173 0 1.737.88 1.737 1.933 0 1.18-.752 2.946-1.139 4.58-.323 1.378.691 2.503 2.053 2.503 2.463 0 4.363-2.585 4.363-6.326 0-3.32-2.386-5.638-5.792-5.638-4.223 0-6.703 3.167-6.703 6.442 0 1.275.492 2.645 1.107 3.393.123.151.141.282.103.433l-.415 1.708c-.066.27-.218.328-.501.198-1.871-.871-3.04-3.605-3.04-5.832 0-4.743 3.447-9.098 9.944-9.098 5.228 0 9.278 3.725 9.278 8.688 0 5.188-3.268 9.358-7.804 9.358-1.523 0-2.956-.79-3.446-1.725l-.941 3.582c-.347 1.321-1.289 2.977-1.921 3.987 1.439.431 2.964.666 4.54.666 6.64 0 12.017-5.367 12.017-12.017C24.033 5.367 18.657 0 12.017 0z" />
            </svg>
            <span className="text-base font-semibold">Save</span>
        </button>
    );
}
