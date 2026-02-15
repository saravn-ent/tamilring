'use client';

import { useState, useRef } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { Ringtone } from '@/types';
// incrementDownloads moved to API route
import { generateRingtoneFilename } from '@/lib/utils';

interface DownloadButtonProps {
    ringtone: Ringtone;
}

export default function DownloadButton({ ringtone }: DownloadButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSmartDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            // Detect OS for format selection (keep this logic as it helps choose correct source URL)
            const userAgent = window.navigator.userAgent;
            const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
            
            let targetUrl = ringtone.audio_url;
            let targetExt = 'mp3';

            if (isIOS && ringtone.audio_url_iphone) {
                 targetUrl = ringtone.audio_url_iphone;
                 targetExt = 'm4r';
            }

            // 1. Generate Filename (Shared Logic)
            const finalFilename = generateRingtoneFilename(
                ringtone.title, 
                ringtone.song_name, 
                ringtone.movie_name, 
                targetExt
            );

            // 2. Fetch via API Proxy (Handles CORS + Counting)
            // We pass the ID so the API calls incrementDownloads server-side
            const apiUrl = `/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(finalFilename)}&id=${ringtone.id}`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Download request failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // 3. Trigger Download
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFilename; // Same-origin blob URL respects this attribute
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);

            // Show success state
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);

        } catch (error) {
            console.error('Download failed', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex-1 w-full" ref={containerRef}>
            <button
                onClick={handleSmartDownload}
                disabled={isDownloading}
                className={`w-full font-normal py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95 border ${showSuccess
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-brand-wash text-zinc-900 border-zinc-200 hover:bg-white transition-colors'
                    } ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {showSuccess ? (
                    <>
                        <CheckCircle2 size={18} strokeWidth={1.5} />
                        <span className="text-sm">Downloaded</span>
                    </>
                ) : isDownloading ? (
                    <div className="w-5 h-5 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
                ) : (
                    <>
                        <Download size={18} strokeWidth={1.5} />
                        <span className="text-sm">Download</span>
                    </>
                )}
            </button>
        </div>
    );
}
