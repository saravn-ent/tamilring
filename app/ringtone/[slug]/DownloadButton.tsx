'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle2, Sparkles } from 'lucide-react';
import { Ringtone } from '@/types';
import { generateRingtoneFilename } from '@/lib/utils';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface DownloadButtonProps {
    ringtone: Ringtone;
    onDownload?: () => void;
    className?: string;
    variant?: 'default' | 'thumb';
    downloadCount?: number;
}

export default function DownloadButton({ ringtone, onDownload, className = '', variant = 'default', downloadCount }: DownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    // 0–100 real progress, null = indeterminate (server processing before bytes arrive)
    const [progress, setProgress] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userAgent = window.navigator.userAgent;
            setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window));
        }
    }, []);

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
        hapticFeedback(hapticPatterns.download);
        setIsDownloading(true);
        setProgress(null); // indeterminate until server responds

        if (onDownload) onDownload();

        try {
            const userAgent = window.navigator.userAgent;
            const iOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);

            let targetUrl = ringtone.audio_url;
            let targetExt = 'mp3';

            if (iOSDevice && ringtone.audio_url_iphone) {
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
                setProgress(null);
                const blob = await response.blob();
                setProgress(100);
                triggerBlobDownload(blob, finalFilename);
            }

            hapticFeedback(hapticPatterns.success);
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

    const isThumb = variant === 'thumb';
    const displayDownloads = downloadCount !== undefined ? downloadCount : (ringtone.downloads || 0);

    const formatCount = (count: number) => {
        if (!count || count <= 0) return '0';
        if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
        return count.toString();
    };

    return (
        <div className={`w-full ${className}`}>
            <button
                type="button"
                onClick={handleSmartDownload}
                disabled={isDownloading}
                className={`group relative w-full overflow-hidden rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-xs ${
                    isThumb
                        ? 'h-10 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm'
                        : 'h-10 px-4 sm:px-5 text-xs sm:text-sm'
                } ${
                    showSuccess
                        ? 'bg-m3-primary text-m3-on-primary border border-m3-primary'
                        : isDownloading
                            ? 'bg-m3-surface-container-high text-m3-on-surface-variant border border-m3-outline-variant/40 cursor-not-allowed'
                            : 'bg-m3-surface-container-low hover:bg-m3-surface-container text-m3-primary border border-m3-primary'
                }`}
                aria-label={showSuccess ? 'Downloaded ringtone' : `Download Ringtone (${formatCount(displayDownloads)})`}
            >
                {/* Progress bar fill — smooth transition */}
                {isDownloading && (
                    <span
                        className="absolute inset-y-0 left-0 bg-m3-primary/15 transition-all duration-300 ease-out"
                        style={{ width: progress !== null ? `${progress}%` : '0%' }}
                    />
                )}

                {/* Indeterminate shimmer when progress is null */}
                {isDownloading && progress === null && (
                    <span className="absolute inset-0 bg-linear-to-r from-transparent via-m3-primary/15 to-transparent animate-[shimmer_1.2s_ease-in-out_infinite]" />
                )}

                {/* Button content */}
                <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                    {showSuccess ? (
                        <>
                            <CheckCircle2 size={16} className="text-m3-on-primary animate-in zoom-in" />
                            <span>Saved!</span>
                        </>
                    ) : isDownloading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-m3-primary/30 border-t-m3-primary rounded-full animate-spin shrink-0" />
                            <span className="tabular-nums text-xs sm:text-sm text-m3-primary font-semibold">
                                {progress !== null
                                    ? `${progress}%`
                                    : elapsed > 1
                                        ? `${elapsed}s`
                                        : 'Connecting…'}
                            </span>
                        </>
                    ) : (
                        <>
                            <Download size={16} className="transition-transform group-hover:-translate-y-0.5 text-m3-primary" />
                            <span className="tracking-tight text-m3-primary font-semibold">Download</span>
                            {displayDownloads > 0 && (
                                <span className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full bg-m3-primary/10 text-m3-primary leading-none">
                                    {formatCount(displayDownloads)}
                                </span>
                            )}
                        </>
                    )}
                </span>
            </button>
        </div>
    );
}


