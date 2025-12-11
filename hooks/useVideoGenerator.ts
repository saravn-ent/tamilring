import { useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export function useVideoGenerator() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    const loadFFmpeg = async () => {
        if (ffmpegRef.current) return ffmpegRef.current;

        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on('progress', ({ progress, time }) => {
            setProgress(Math.round(progress * 100));
        });

        // Use local files for valid COOP/COEP headers if handled, or CDN if not
        const baseURL = `${window.location.origin}/ffmpeg`;

        try {
            await ffmpeg.load({
                coreURL: `${baseURL}/ffmpeg-core.js`,
                wasmURL: `${baseURL}/ffmpeg-core.wasm`,
            });
        } catch (e) {
            console.error("Failed to load local FFmpeg, trying CDN fallback...", e);
            const cdnBase = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            await ffmpeg.load({
                coreURL: `${cdnBase}/ffmpeg-core.js`,
                wasmURL: `${cdnBase}/ffmpeg-core.wasm`,
            });
        }

        return ffmpeg;
    };

    const generateVideo = async (audioUrl: string, imageUrl: string, metadata: VideoMetadata): Promise<Blob | null> => {
        setIsGenerating(true);
        setProgress(0);

        try {
            const ffmpeg = await loadFFmpeg();

            const imageExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
            const audioExt = 'mp3';

            // Allow fetchFile to handle URL directly (via Proxy to avoid CORS)
            const proxyImageUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;

            // 1. Compose Image (Canvas)
            const composedImageBlob = await composeImage(proxyImageUrl, metadata);
            const jpgName = 'input_image.jpg';
            await ffmpeg.writeFile(jpgName, await fetchFile(composedImageBlob));
            await ffmpeg.writeFile(`input_audio.${audioExt}`, await fetchFile(audioUrl));

            // 2. Run Command
            // Vertical Video 720x1280
            await ffmpeg.exec([
                '-loop', '1',
                '-i', jpgName,
                '-i', `input_audio.${audioExt}`,
                '-c:v', 'libx264',
                '-tune', 'stillimage',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-pix_fmt', 'yuv420p',
                '-vf', 'scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=black',
                '-shortest',
                'output.mp4'
            ]);

            // 3. Read output
            const data = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([data as any], { type: 'video/mp4' });

            return blob;

        } catch (error) {
            console.error("Video Generation Failed", error);
            alert("Failed to generate video. Please try again.");
            return null;
        } finally {
            setIsGenerating(false);
            setProgress(0);
        }
    };

    return { generateVideo, isGenerating, progress };
}

export interface VideoMetadata {
    title: string;
    movie: string;
    artists: string;
    music_director: string;
    setFor?: string; // e.g. "Dad", "Brother", or undefined
}

async function composeImage(imageUrl: string, metadata: VideoMetadata): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas'); // Main Canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
        }

        // 9:16 Resolution
        const width = 720;
        const height = 1280;
        canvas.width = width;
        canvas.height = height;

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            try {
                // --- 1. Background (Immersive & Deep) ---
                // Draw resized image to cover
                const scaleBg = Math.max(width / img.width, height / img.height);
                const bgWidth = img.width * scaleBg;
                const bgHeight = img.height * scaleBg;
                const bgX = (width - bgWidth) / 2;
                const bgY = (height - bgHeight) / 2;

                ctx.save();
                ctx.drawImage(img, bgX, bgY, bgWidth, bgHeight);

                // Heavy Blur for background
                ctx.filter = 'blur(40px) brightness(0.6) saturate(1.2)';
                ctx.drawImage(canvas, 0, 0); // Draw itself to apply blur efficiently
                ctx.filter = 'none';

                // Dark Overlay Gradient (Top-Down) for text readability
                const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
                bgGradient.addColorStop(0, 'rgba(0,0,0,0.4)');
                bgGradient.addColorStop(0.4, 'rgba(0,0,0,0.2)');
                bgGradient.addColorStop(0.8, 'rgba(0,0,0,0.8)');
                bgGradient.addColorStop(1, 'rgba(0,0,0,0.95)');
                ctx.fillStyle = bgGradient;
                ctx.fillRect(0, 0, width, height);

                // Noise Texture (Film Grain Effect)
                generateNoise(ctx, width, height, 0.08);
                ctx.restore();


                // --- 2. Glass Card Container ---
                const cardW = width - 80; // 40px padding each side
                const cardH = height * 0.65; // Occupy 65% of screen
                const cardX = 40;
                const cardY = (height - cardH) / 2 - 50; // Slightly shifted up

                ctx.save();
                // Card Shadow
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 60;
                ctx.shadowOffsetY = 30;

                // Card Sape
                ctx.beginPath();
                ctx.roundRect(cardX, cardY, cardW, cardH, 40);

                // Card Fill (Glass)
                const glassGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
                glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
                glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
                ctx.fillStyle = glassGradient;
                ctx.fill();

                // Card Border (subtle rim)
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Clear shadow for content
                ctx.shadowColor = 'transparent';
                ctx.restore();


                // --- 3. Album Art (Inside Glass Card) ---
                const artSize = 480;
                const artX = (width - artSize) / 2;
                const artY = cardY + 60;
                const artRadius = 24;

                ctx.save();
                // Album Art Shadow
                ctx.shadowColor = 'rgba(0,0,0,0.4)';
                ctx.shadowBlur = 30;
                ctx.shadowOffsetY = 15;

                ctx.beginPath();
                ctx.roundRect(artX, artY, artSize, artSize, artRadius);
                ctx.clip();

                // Draw centered crop of image
                const minDim = Math.min(img.width, img.height);
                const sx = (img.width - minDim) / 2;
                const sy = (img.height - minDim) / 2;
                ctx.drawImage(img, sx, sy, minDim, minDim, artX, artY, artSize, artSize);

                // Inner Border for Art
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();


                // --- 4. Content & Typography ---
                const contentStartY = artY + artSize + 50;
                const centerX = width / 2;

                // Title
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.font = '700 32px "Inter", sans-serif';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 4;
                // Letter spacing
                canvas.style.letterSpacing = '0.5px'; // Hacky? No, canvas doesn't support CSS directly, need to do manually or ignore.
                // We'll scale font slightly instead.
                let currentY = wrapText(ctx, metadata.title, centerX, contentStartY, cardW - 60, 44);

                // Movie Name
                currentY += 10;
                ctx.fillStyle = '#a1a1aa'; // Zinc-400
                ctx.font = '500 24px "Inter", sans-serif';
                ctx.fillText(metadata.movie, centerX, currentY);

                // Divider (Small line)
                currentY += 35;
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.moveTo(centerX - 30, currentY);
                ctx.lineTo(centerX + 30, currentY);
                ctx.stroke();

                // Artists
                currentY += 35;
                ctx.fillStyle = '#d1d5db'; // Gray-300
                ctx.font = '400 20px "Inter", sans-serif';
                let artistText = metadata.artists;
                if (artistText.length > 60) artistText = artistText.substring(0, 57) + '...';
                ctx.fillText(artistText + (metadata.music_director ? ` • ${metadata.music_director}` : ''), centerX, currentY);


                // --- 5. "For Someone" Tag (Floating at bottom of card) ---
                if (metadata.setFor) {
                    // Pill Style
                    const name = metadata.setFor;
                    ctx.font = '600 22px "Inter", sans-serif';
                    const metrics = ctx.measureText(name);
                    const pillPadding = 40;
                    const pillRefLabel = "Dedicate to";
                    const labelMetrics = ctx.measureText(pillRefLabel);

                    // We'll redesign this to be cleaner
                    const pillY = cardY + cardH - 50;

                    // Just text for cleaner look? Or a sleek button?
                    // Sleek dark pill
                    const pillH = 48;
                    const pillW = Math.max(metrics.width, 100) + 60;
                    const pillX = centerX - pillW / 2;
                    const pillTop = pillY - pillH / 2;

                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(pillX, pillTop, pillW, pillH, 24);
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.stroke();

                    ctx.fillStyle = '#10b981'; // Emerald
                    ctx.textBaseline = 'middle';
                    ctx.fillText(name, centerX, pillY + 2);
                    ctx.restore();
                }

                // --- 6. Footer Branding (Outside Glass Card) ---
                const footerY = height - 80;
                ctx.save();
                ctx.textAlign = 'center';

                // Logo
                const logoSize = 32;
                const logoText = "TamilRing.in";
                ctx.font = '700 28px "Inter", sans-serif';

                // Helper to draw multi-color text centered
                const wT = ctx.measureText("Tamil").width;
                const wR = ctx.measureText("Ring").width;
                const wI = ctx.measureText(".in").width;
                const totalW = wT + wR + wI;
                let startX = centerX - totalW / 2;

                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.fillText("Tamil", startX, footerY);
                startX += wT;
                ctx.fillStyle = '#10b981';
                ctx.fillText("Ring", startX, footerY);
                startX += wR;
                ctx.fillStyle = '#ffffff';
                ctx.fillText(".in", startX, footerY);

                // Tiny Caption
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '400 14px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("Premium Ringtones & BGM", centerX, footerY + 25);
                ctx.restore();

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob failed'));
                }, 'image/jpeg', 0.95);

            } catch (err) {
                reject(err);
            }
        };
        img.onerror = (e) => reject(e);
        img.src = imageUrl;
    });
}

// Generate simple static noise
function generateNoise(ctx: CanvasRenderingContext2D, width: number, height: number, alpha: number) {
    const w = width;
    const h = height;
    const idata = ctx.createImageData(w, h);
    const buffer32 = new Uint32Array(idata.data.buffer);
    const len = buffer32.length;

    for (let i = 0; i < len; i++) {
        if (Math.random() < 0.5) {
            // mild white noise
            // 0x(alpha)(b)(g)(r) -> Little Endian
            // We want white pixel with low alpha. 
            // 255, 255, 255, alpha * 255
            const a = (Math.random() * alpha * 255) | 0;
            buffer32[i] = (a << 24) | (255 << 16) | (255 << 8) | 255;
        }
    }

    // Draw noise ont a temporary canvas to apply blending mode if possible, 
    // but putImageData doesn't support blend modes.
    // Instead we used low alpha directly in pixels.
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
        tempCtx.putImageData(idata, 0, 0);
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
    return currentY;
}
