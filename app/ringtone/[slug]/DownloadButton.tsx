'use client';

import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { Ringtone } from '@/types';
import { incrementDownloads } from '@/app/actions/ringtones';

interface DownloadButtonProps {
    ringtone: Ringtone;
}

export default function DownloadButton({ ringtone }: DownloadButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSmartDownload = async () => {
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

            // Clean filename: [Segment Name] [Song Name]
            let segment = ringtone.title;
            const song = ringtone.song_name ? ringtone.song_name.trim() : '';
            const movie = ringtone.movie_name ? ringtone.movie_name.trim() : '';

            const cleanText = (text: string, toRemove: string) => {
                if (!toRemove) return text;
                const escaped = toRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Remove the text anywhere in the string (case insensitive)
                return text.replace(new RegExp(escaped, 'gi'), '').trim();
            };

            // 1. Remove Movie
            segment = cleanText(segment, movie);
            // 2. Remove Song
            if (song) segment = cleanText(segment, song);

            // 3. Remove "Vocal" tag & Normalize
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

            // Remove special characters not allowed in filenames
            cleanFilename = cleanFilename.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ');

            const finalFilename = `TamilRing.in - ${cleanFilename}.${targetExt}`;
            triggerDownload(url, finalFilename);

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
                className="w-full bg-brand-wash text-black border border-brand-border font-normal py-2.5 px-4 rounded-lg hover:bg-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
                <Download size={18} strokeWidth={1.5} />
                <span className="text-sm">Download</span>
            </button>
        </div>
    );
}
