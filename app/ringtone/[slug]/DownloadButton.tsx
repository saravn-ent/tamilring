'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { Ringtone } from '@/types';
import { generateRingtoneFilename } from '@/lib/utils';

interface DownloadButtonProps {
    ringtone: Ringtone;
    onDownload?: () => void;
}

export default function DownloadButton({ ringtone, onDownload }: DownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    // 0–100 real progress, null = indeterminate (server processing before bytes arrive)
    const [progress, setProgress] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Elapsed-seconds ticker while downloading
    useEffect(() => {
        if (isDownloading) {
            setElapsed(0);
            timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isDownloading]);

    const handleSmartDownload = async () => {
        if (isDownloading || showSuccess) return;
        setIsDownloading(true);
        setProgress(null); // indeterminate until server responds

        if (onDownload) onDownload();

        try {
            const userAgent = window.navigator.userAgent;
            const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);

            let targetUrl = ringtone.audio_url;
            let targetExt = 'mp3';

            if (isIOS && ringtone.audio_url_iphone) {
                targetUrl = ringtone.audio_url_iphone;
                targetExt = 'm4r';
            }

            const finalFilename = generateRingtoneFilename(
                ringtone.title,
                ringtone.song_name,
                ringtone.movie_name,
                targetExt
            );

            const params = new URLSearchParams({ url: targetUrl, filename: finalFilename, id: ringtone.id });
            if (ringtone.title) params.set('title', ringtone.title);
            if (ringtone.singers || ringtone.music_director) {
                params.set('artist', ringtone.singers || ringtone.music_director || '');
            }
            if (ringtone.movie_name) params.set('album', ringtone.movie_name);
            if (ringtone.poster_url) params.set('poster', ringtone.poster_url);

            const apiUrl = `/api/download?${params.toString()}`;

            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Download request failed');

            // Read content-length for real progress tracking
            const contentLength = Number(response.headers.get('content-length') ?? 0);
            const reader = response.body?.getReader();

            if (reader && contentLength > 0) {
                // Stream with real byte-level progress
                const chunks: Uint8Array[] = [];
                let received = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    received += value.length;
                    setProgress(Math.min(99, Math.round((received / contentLength) * 100)));
                }

                // Merge chunks into a single buffer
                const total = chunks.reduce((n, c) => n + c.length, 0);
                const combined = new Uint8Array(total);
                let offset = 0;
                for (const chunk of chunks) {
                    combined.set(chunk, offset);
                    offset += chunk.length;
                }

                setProgress(100);
                const blob = new Blob([combined], { type: 'audio/mpeg' });
                triggerBlobDownload(blob, finalFilename);

            } else {
                // Fallback: no content-length (e.g. chunked encoding) — read whole blob
                setProgress(null); // keep indeterminate spinner
                const blob = await response.blob();
                setProgress(100);
                triggerBlobDownload(blob, finalFilename);
            }

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);

        } catch (error) {
            console.error('Download failed', error);
            setProgress(null);
        } finally {
            setIsDownloading(false);
        }
    };

    function triggerBlobDownload(blob: Blob, filename: string) {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    }

    return (
        <div className="flex-1 w-full">
            <button
                onClick={handleSmartDownload}
                disabled={isDownloading}
                className={`relative w-full overflow-hidden font-normal py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95 border ${
                    showSuccess
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : isDownloading
                            ? 'bg-white text-zinc-600 border-zinc-200 cursor-not-allowed'
                            : 'bg-brand-wash text-zinc-900 border-zinc-200 hover:bg-white transition-colors'
                }`}
            >
                {/* Progress bar fill — slides in from left */}
                {isDownloading && (
                    <span
                        className="absolute inset-y-0 left-0 bg-brand-accent/10 transition-all duration-300 ease-out"
                        style={{ width: progress !== null ? `${progress}%` : '0%' }}
                    />
                )}

                {/* Indeterminate shimmer when progress is null */}
                {isDownloading && progress === null && (
                    <span className="absolute inset-0 bg-linear-to-r from-transparent via-brand-accent/10 to-transparent animate-[shimmer_1.2s_ease-in-out_infinite]" />
                )}

                {/* Button content */}
                <span className="relative z-10 flex items-center gap-2">
                    {showSuccess ? (
                        <>
                            <CheckCircle2 size={18} strokeWidth={1.5} />
                            <span className="text-sm">Downloaded!</span>
                        </>
                    ) : isDownloading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin shrink-0" />
                            <span className="text-sm tabular-nums">
                                {progress !== null
                                    ? `Downloading… ${progress}%`
                                    : elapsed > 1
                                        ? `Preparing… ${elapsed}s`
                                        : 'Preparing…'}
                            </span>
                        </>
                    ) : (
                        <>
                            <Download size={18} strokeWidth={1.5} />
                            <span className="text-sm">Download</span>
                        </>
                    )}
                </span>
            </button>
        </div>
    );
}
