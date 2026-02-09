'use client';

import { useState, useRef } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { Ringtone } from '@/types';
import { incrementDownloads } from '@/app/actions/ringtones';

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
            // 1. Increment Count
            incrementDownloads(ringtone.id);

            // 2. Detect OS
            const userAgent = window.navigator.userAgent;
            const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);

            // 3. Select Format
            let targetUrl = ringtone.audio_url;
            let targetExt = 'mp3';

            if (isIOS) {
                if (ringtone.audio_url_iphone) {
                    targetUrl = ringtone.audio_url_iphone;
                    targetExt = 'm4r';
                }
            }

            // 4. Trigger Download
            const response = await fetch(targetUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Clean filename
            let segment = ringtone.title;
            const song = ringtone.song_name ? ringtone.song_name.trim() : '';
            const movie = ringtone.movie_name ? ringtone.movie_name.trim() : '';

            const cleanText = (text: string, toRemove: string) => {
                if (!toRemove) return text;
                const escaped = toRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return text.replace(new RegExp(escaped, 'gi'), '').trim();
            };

            segment = cleanText(segment, movie);
            if (song) segment = cleanText(segment, song);
            segment = segment.replace(/\bVocal\b/gi, '').trim();
            segment = segment
                .replace(/\(From.*?\)/gi, '')
                .replace(/^[-–—:|]+|[-–—:|]+$/g, '')
                .replace(/\s+[-–—:|]+\s+/g, ' - ')
                .trim();

            let cleanFilename = '';
            if (segment && song) {
                cleanFilename = `${segment} - ${song}`;
            } else if (segment) {
                cleanFilename = segment;
            } else if (song) {
                cleanFilename = song;
            } else {
                cleanFilename = ringtone.title;
            }

            cleanFilename = cleanFilename.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ');
            const finalFilename = `TamilRing.in - ${cleanFilename}.${targetExt}`;

            triggerDownload(url, finalFilename);

            // Show success state
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);

        } catch (error) {
            console.error('Download failed', error);
        } finally {
            setIsDownloading(false);
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
