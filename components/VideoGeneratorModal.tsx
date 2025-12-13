'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Video, Loader2, Download, AlertCircle } from 'lucide-react';
import { Ringtone } from '@/types';
import SpotifyCard from './SpotifyCard';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

interface VideoGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    ringtone: Ringtone;
}

export default function VideoGeneratorModal({ isOpen, onClose, ringtone }: VideoGeneratorModalProps) {
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

    // Canvas Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            loadFFmpeg();
            setGenerating(false);
            setProgress(0);
            setStatus('');
        }
    }, [isOpen]);

    const loadFFmpeg = async () => {
        if (ffmpegRef.current && ffmpegRef.current.loaded) {
            setFfmpegLoaded(true);
            return;
        }

        try {
            const { FFmpeg } = await import('@ffmpeg/ffmpeg');
            const { toBlobURL } = await import('@ffmpeg/util');

            if (!ffmpegRef.current) {
                ffmpegRef.current = new FFmpeg();
            }

            const ffmpeg = ffmpegRef.current;
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

            ffmpeg.on('progress', ({ progress, time }) => {
                // Approximate progress based on time if available, or just raw progress
                setProgress(Math.round(progress * 100));
            });

            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setFfmpegLoaded(true);
        } catch (err) {
            console.error('Failed to load FFmpeg', err);
            setStatus('Failed to load video engine. Please try again.');
        }
    };

    /**
     * Draws the "Spotify Card" look onto the hidden canvas
     */
    const drawToCanvas = async (): Promise<Blob | null> => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Set dimensions (720x1280 for Stories/Reels - Optimized for Web Rendering)
        canvas.width = 720;
        canvas.height = 1280;

        // Load image once
        let img: HTMLImageElement | null = null;
        if (ringtone.poster_url) {
            try {
                img = await new Promise((resolve, reject) => {
                    const image = new Image();
                    image.crossOrigin = "anonymous";
                    image.onload = () => resolve(image);
                    image.onerror = () => reject(new Error(`Failed to load image. Likely CORS issue. URL: ${ringtone.poster_url}`));
                    image.src = `/api/proxy-image?url=${encodeURIComponent(ringtone.poster_url)}`;
                });
            } catch (e) {
                console.error("Image load error:", e);
                // Continue without image or fail?
                // If we fail here, we can't generate the video as intended.
                throw e;
            }
        }

        // 1. Draw Background (Blurred Image or Gradient)
        if (img) {
            // Draw scaled up image for background
            ctx.filter = 'blur(60px) brightness(0.6)';
            // Center crop scaling
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * 1.5;
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            ctx.filter = 'none'; // Reset filter
        } else {
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, '#111');
            grad.addColorStop(1, '#000');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Draw Main Image (Polaroid Style)
        if (img) {
            // Card container - Compact (Scaled down for 720p)
            const cardW = 240; // Was 360
            const cardH = 320; // Was 480
            const cardX = (canvas.width - cardW) / 2;

            // Center Y ~ 400
            const cardY = 400;

            // Shadow
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 10;

            // Draw Image with rounded corners (Clip)
            ctx.save();
            roundedRect(ctx, cardX, cardY, cardW, cardH, 15);
            ctx.clip();
            // Aspect fill
            const scale = Math.max(cardW / img.width, cardH / img.height);
            const x = cardX + (cardW - img.width * scale) / 2;
            const y = cardY + (cardH - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            ctx.restore();

            // Reset Shadow
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
        }

        // 3. Draw Text
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';

        // Base Y position below the card
        let textY = 400 + 320 + 30; // cardY + cardH + gap

        // Title
        ctx.font = 'bold 28px Inter, sans-serif'; // Scaled font
        const cleanTitle = ringtone.title.replace(/\(From ".*?"\)/i, '').trim();
        wrapText(ctx, cleanTitle, canvas.width / 2, textY, 600, 35);

        // Calculate lines
        const titleLines = cleanTitle.length > 30 ? 2 : 1;
        textY += (titleLines * 35) + 10;

        // Movie Name & Year
        ctx.font = '500 20px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const movieInfo = `${ringtone.movie_name} (${ringtone.movie_year})`;
        ctx.fillText(movieInfo, canvas.width / 2, textY);

        // Branding
        textY += 40;
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillStyle = '#10b981'; // Emerald 500
        ctx.fillText('TAMILRING.IN', canvas.width / 2, textY);


        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    };

    const generateVideo = async () => {
        if (!ffmpegRef.current || !ffmpegLoaded) return;

        setGenerating(true);
        setStatus('Preparing artwork...');

        try {
            const ffmpeg = ffmpegRef.current;
            const { fetchFile } = await import('@ffmpeg/util');

            // 1. Generate Image
            const imageBlob = await drawToCanvas();
            if (!imageBlob) throw new Error("Failed to draw canvas");

            setStatus('Loading audio...');

            // 2. Write Files
            const imageFile = 'image.png';
            const audioExtension = ringtone.audio_url.split('.').pop() || 'mp3';
            const audioFile = `audio.${audioExtension}`;
            const outputFile = 'output.mp4';

            await ffmpeg.writeFile(imageFile, await fetchFile(imageBlob));

            try {
                // Fetch audio with detailed error handling
                const audioData = await fetchFile(ringtone.audio_url);
                await ffmpeg.writeFile(audioFile, audioData);
            } catch (audioErr) {
                console.error("Audio fetch error:", audioErr);
                throw new Error(`Failed to load audio file: ${ringtone.audio_url}. May be CORS or network blocked.`);
            }

            setStatus('Rendering video (this may take a moment)...');

            // 3. Run FFmpeg
            // -loop 1: loop image
            // -tunestillimage: optimize for still image
            // -shortest: end when audio ends
            // -pix_fmt yuv420p: Ensure compatibility with all players (QuickTime etc)
            // -vf scale: ensure even dimensions (sometimes odd dims fail)
            // -preset ultrafast: Create it quickly!
            await ffmpeg.exec([
                '-loop', '1',
                '-i', imageFile,
                '-i', audioFile,
                '-c:v', 'libx264',
                '-t', '30', // Max 30s
                '-pix_fmt', 'yuv420p',
                '-vf', 'scale=720:1280', // Optimized to 720p for speed (was 1080p)
                '-r', '24', // Explicit 24fps
                '-shortest',
                '-preset', 'ultrafast',
                outputFile
            ]);

            setStatus('Finalizing...');
            const data = await ffmpeg.readFile(outputFile);

            // 4. Download
            const blob = new Blob([data as any], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${cleanTitle(ringtone.title)}_TamilRing.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Cleanup
            try {
                await ffmpeg.deleteFile(imageFile);
                await ffmpeg.deleteFile(audioFile);
                await ffmpeg.deleteFile(outputFile);
            } catch (cleanupErr) {
                console.warn("Cleanup failed", cleanupErr);
            }

            onClose();

        } catch (error: any) {
            console.error("Video Generation Error:", error);
            setStatus(`Error: ${error.message || 'Unknown error'}`);
        } finally {
            setGenerating(false);
        }
    };

    // Helper Utils
    function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function cleanTitle(title: string) {
        return title.replace(/\(From ".*?"\)/i, '').trim();
    }

    function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-neutral-900 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">

                {/* Preview Section */}
                <div className="flex-1 bg-black/50 p-8 flex items-center justify-center relative overflow-hidden">
                    {/* The Canvas (Hidden but used for generation) */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Visual Preview (React Component) */}
                    <SpotifyCard ringtone={ringtone} className="scale-90 md:scale-100 shadow-2xl" />
                </div>

                {/* Controls Section */}
                <div className="w-full md:w-96 p-8 flex flex-col justify-between bg-neutral-900">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-white">Share Video</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <p className="text-zinc-400 mb-8">
                            Create a stunning video story for Instagram, WhatsApp, or TikTok.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex gap-3 text-emerald-500 text-sm">
                                <Video size={20} className="shrink-0" />
                                <span>Export format: <strong>MP4 (Vertical 9:16)</strong></span>
                            </div>

                            {!ffmpegLoaded && (
                                <div className="text-sm text-zinc-500 flex gap-2 items-center">
                                    <Loader2 className="animate-spin" size={14} />
                                    Loading video engine...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 mt-8">
                        {status && (
                            <div className="text-xs text-center font-mono text-zinc-400">{status}</div>
                        )}

                        <button
                            onClick={generateVideo}
                            disabled={generating || !ffmpegLoaded}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {progress > 0 ? `Rendering ${progress}%` : 'Processing...'}
                                </>
                            ) : (
                                <>
                                    <Download size={20} />
                                    <span>Download Video</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
