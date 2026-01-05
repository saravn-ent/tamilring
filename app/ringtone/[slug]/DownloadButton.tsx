'use client';

import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { Ringtone } from '@/types';
import { incrementDownloads } from '@/app/actions/ringtones';

interface DownloadButtonProps {
    ringtone: Ringtone;
}

export default function DownloadButton({ ringtone }: DownloadButtonProps) {
    const [downloadCount, setDownloadCount] = useState(ringtone.downloads || 0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSmartDownload = async () => {
        try {
            // 1. Increment Count (Optimistic)
            setDownloadCount(prev => prev + 1);
            incrementDownloads(ringtone.id);

            // 2. Detect OS
            const userAgent = window.navigator.userAgent;
            const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

            // 3. Select Format
            let targetUrl = ringtone.audio_url;
            let targetExt = 'mp3';

            if (isIOS) {
                if (ringtone.audio_url_iphone) {
                    targetUrl = ringtone.audio_url_iphone;
                    targetExt = 'm4r';
                } else {
                    // Fallback to MP3 if M4R is missing, but maybe warn or just proceed?
                    // User requested auto-detect, so if missing, falling back to MP3 is safer than failing 
                    // unless we strictly want to prevent it. Assuming fallback is better for now.
                    console.warn("iPhone detected but no M4R found, falling back to MP3");
                    // Optionally could alert: alert('iPhone optimized version not available, downloading MP3.');
                }
            }

            // 4. Trigger Download
            // Using fetch to blob ensures we can force the filename and avoid playing in browser
            const response = await fetch(targetUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            triggerDownload(url, `${ringtone.slug}.${targetExt}`);

        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const triggerDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="relative flex-1" ref={containerRef}>
            <button
                onClick={handleSmartDownload}
                className="w-full bg-neutral-800 text-white font-medium py-4 rounded-xl hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <Download size={20} />
                <span>Download</span>
            </button>
        </div>
    );
}
