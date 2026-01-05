'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, ZoomIn, ZoomOut, Scissors, RotateCcw } from 'lucide-react';
import type WaveSurfer from 'wavesurfer.js';
import type RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';

export default function AudioTrimmer({ file, onRangeChange }: { file: File, onRangeChange?: (start: number, end: number) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WaveSurfer | null>(null);
    const regionsRef = useRef<RegionsPlugin | null>(null);
    const ffmpegRef = useRef<any>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [zoom, setZoom] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [localStart, setLocalStart] = useState(0);
    const [localEnd, setLocalEnd] = useState(30);
    const MIN_DURATION = 10;
    const [processing, setProcessing] = useState(false);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

    const loadingRef = useRef(false);

    // Load FFmpeg
    useEffect(() => {
        const loadFFmpeg = async () => {
            const FFmpeg = (window as any).FFmpeg;
            if (!FFmpeg) return;

            if (loadingRef.current) return;
            loadingRef.current = true;

            try {
                if (!ffmpegRef.current) {
                    ffmpegRef.current = FFmpeg.createFFmpeg({
                        log: true,
                        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
                    });
                }
                if (!ffmpegRef.current.isLoaded()) {
                    await ffmpegRef.current.load();
                }
                setFfmpegLoaded(true);
            } catch (e) {
                console.error("FFmpeg Error:", e);
            } finally {
                loadingRef.current = false;
            }
        };
        loadFFmpeg();
    }, []);

    // Initialize WaveSurfer
    useEffect(() => {
        if (!containerRef.current || !timelineRef.current || !file) return;

        let ws: WaveSurfer;
        let wsRegions: RegionsPlugin;

        const init = async () => {
            try {
                const WaveSurferModule = await import('wavesurfer.js');
                const Regions = await import('wavesurfer.js/dist/plugins/regions.esm.js');
                const Timeline = await import('wavesurfer.js/dist/plugins/timeline.esm.js');

                const WaveSurfer = WaveSurferModule.default || WaveSurferModule;
                const RegionsPlugin = Regions.default || Regions;
                const TimelinePlugin = Timeline.default || Timeline;

                if (wsRef.current) wsRef.current.destroy();

                ws = WaveSurfer.create({
                    container: containerRef.current!,
                    waveColor: '#52525b', // Zinc 600
                    progressColor: '#10b981', // Emerald 500
                    cursorColor: '#facc15',   // Yellow 400
                    barWidth: 2,
                    barGap: 3,
                    barRadius: 3,
                    height: 120,
                    url: URL.createObjectURL(file), // Helper to create blob URL
                    normalize: true,
                    minPxPerSec: 50, // Minimum zoom for better visibility
                    interact: true,
                    hideScrollbar: false,
                    plugins: [
                        TimelinePlugin.create({
                            container: timelineRef.current!,
                            height: 20,
                            style: {
                                fontSize: '11px',
                                color: '#a1a1aa',
                            }
                        }),
                        wsRegions = RegionsPlugin.create()
                    ]
                });

                wsRef.current = ws;
                regionsRef.current = wsRegions;

                ws.on('decode', () => {
                    setIsReady(true);
                    initRegion(ws, wsRegions);
                });

                ws.on('timeupdate', (t) => setCurrentTime(t));
                ws.on('play', () => setIsPlaying(true));
                ws.on('pause', () => setIsPlaying(false));

                // Region Logic
                wsRegions.on('region-updated', (region) => {
                    // Enforce Minimum Duration
                    if (region.end - region.start < MIN_DURATION) {
                        if (Math.abs(region.start - localStart) > 0.1) {
                            // Moved Start
                            region.start = region.end - MIN_DURATION;
                        } else {
                            // Moved End
                            region.end = region.start + MIN_DURATION;
                        }
                        // Hack to force update if needed, but usually modifying prop works
                    }
                    setLocalStart(region.start);
                    setLocalEnd(region.end);
                });

                wsRegions.on('region-clicked', (region, e) => {
                    e.stopPropagation();
                    region.play();
                });

            } catch (err) {
                console.error("WaveSurfer Init Error", err);
            }
        };

        const initRegion = (wsInstance: any, regionsInstance: any) => {
            const duration = wsInstance.getDuration();
            // Center 30s
            const start = Math.max(0, (duration / 2) - 15);
            const end = Math.min(start + 30, duration);

            regionsInstance.clearRegions();
            regionsInstance.addRegion({
                start,
                end,
                color: 'rgba(244, 63, 94, 0.3)',
                drag: true,
                resize: true,
            });

            setLocalStart(start);
            setLocalEnd(end);

            // Initial Zoom to fit reasonably
            const fitZoom = containerRef.current!.clientWidth / duration;
            setZoom(fitZoom);
            wsInstance.zoom(fitZoom);
        };

        init();

        return () => {
            if (ws) ws.destroy();
        };
    }, [file]);


    const [fadeIn, setFadeIn] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    const handleDownload = async (format: 'mp3' | 'm4r') => {
        if (!ffmpegRef.current || !ffmpegLoaded) return;
        setProcessing(true);
        try {
            const ffmpeg = ffmpegRef.current;
            const { fetchFile } = (window as any).FFmpeg;
            const inputName = 'input.audio';
            const outputName = `ringtone.${format}`;

            ffmpeg.FS('writeFile', inputName, await fetchFile(file));

            const duration = localEnd - localStart;
            let args = [];

            // Build filter chain for fading
            let filters = [];
            if (fadeIn) filters.push(`afade=t=in:ss=0:d=2`);
            if (fadeOut) filters.push(`afade=t=out:st=${(duration - 2).toFixed(2)}:d=2`);

            const filterStr = filters.length > 0 ? filters.join(',') : null;

            if (format === 'm4r') {
                // iPhone AAC
                args = ['-ss', localStart.toString(), '-t', duration.toString(), '-i', inputName];
                if (filterStr) args.push('-af', filterStr);
                args.push('-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', outputName);
            } else {
                // MP3
                args = ['-ss', localStart.toString(), '-t', duration.toString(), '-i', inputName];
                if (filterStr) args.push('-af', filterStr);
                args.push('-c:a', 'libmp3lame', '-b:a', '192k', '-f', 'mp3', outputName);
            }

            await ffmpeg.run(...args);
            const data = ffmpeg.FS('readFile', outputName);
            const blob = new Blob([data.buffer], { type: format === 'm4r' ? 'audio/x-m4r' : 'audio/mpeg' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tamilring_${Date.now()}.${format}`;
            a.click();

            ffmpeg.FS('unlink', inputName);
            ffmpeg.FS('unlink', outputName);
        } catch (e) {
            console.error(e);
            alert("Export failed");
        } finally {
            setProcessing(false);
        }
    };

    // Propagate range changes
    useEffect(() => {
        if (onRangeChange) {
            onRangeChange(localStart, localEnd);
        }
    }, [localStart, localEnd]);

    // Zoom Controls
    const updateZoom = (newZoom: number) => {
        if (!wsRef.current) return;
        const duration = wsRef.current.getDuration() || 1;
        const width = containerRef.current?.clientWidth || 100;
        const minZoom = width / duration;
        const appliedZoom = Math.max(minZoom, newZoom);

        setZoom(appliedZoom);
        wsRef.current.zoom(appliedZoom);
    };

    const updateRegionManual = (newStart: number, newEnd: number) => {
        if (!regionsRef.current) return;
        regionsRef.current.clearRegions();
        regionsRef.current.addRegion({
            start: newStart,
            end: newEnd,
            color: 'rgba(244, 63, 94, 0.3)',
            drag: true,
            resize: true
        });
        setLocalStart(newStart);
        setLocalEnd(newEnd);
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
    };

    return (
        <div className="bg-zinc-900 rounded-2xl border border-white/5 p-4 space-y-6 select-none shadow-xl">
            {/* Waveform Wrapper */}
            <div className="relative bg-black/40 rounded-xl border border-white/5 p-4">
                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-500 font-bold z-20">
                        Loading Audio...
                    </div>
                )}

                {/* Main Waveform */}
                <div ref={containerRef} className="w-full" />

                {/* Timeline */}
                <div ref={timelineRef} className="w-full" />

                <div className="absolute top-2 right-2 text-[10px] font-mono text-zinc-400 pointer-events-none">
                    {formatTime(currentTime)}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4 bg-neutral-800/30 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col">
                    <label className="text-[10px] text-zinc-500 font-bold mb-1">START</label>
                    <input
                        type="number" step="0.1"
                        value={localStart.toFixed(1)}
                        onChange={(e) => updateRegionManual(Number(e.target.value), localEnd)}
                        className="w-20 bg-black border border-neutral-700 rounded-lg p-1 text-center text-sm font-mono text-white"
                    />
                </div>
                <div className="text-rose-500 font-mono text-sm font-bold bg-rose-500/10 px-3 py-1 rounded">
                    {(localEnd - localStart).toFixed(1)}s
                </div>
                <div className="flex flex-col items-end">
                    <label className="text-[10px] text-zinc-500 font-bold mb-1">END</label>
                    <input
                        type="number" step="0.1"
                        value={localEnd.toFixed(1)}
                        onChange={(e) => updateRegionManual(localStart, Number(e.target.value))}
                        className="w-20 bg-black border border-neutral-700 rounded-lg p-1 text-center text-sm font-mono text-white"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
                <div className="flex justify-center gap-6 items-center">
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => setFadeIn(!fadeIn)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${fadeIn ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                        >
                            FADE IN
                        </button>
                    </div>

                    <button onClick={() => { wsRef.current?.seekTo(0); wsRef.current?.play(); }} className="p-3 text-zinc-400 hover:text-white bg-white/5 rounded-full transition-colors">
                        <RotateCcw size={20} />
                    </button>
                    <button onClick={() => wsRef.current?.playPause()} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 shadow-lg transition-all active:scale-95">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>

                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => setFadeOut(!fadeOut)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${fadeOut ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                        >
                            FADE OUT
                        </button>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button onClick={() => updateZoom(zoom - 10)} className="p-3 text-zinc-400 hover:text-emerald-500 bg-white/5 rounded-full transition-colors" title="Zoom Out"><ZoomOut size={18} /></button>
                    <button onClick={() => updateZoom(zoom + 10)} className="p-3 text-zinc-400 hover:text-emerald-500 bg-white/5 rounded-full transition-colors" title="Zoom In"><ZoomIn size={18} /></button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <button onClick={() => handleDownload('mp3')} disabled={processing} className="flex justify-center items-center gap-2 bg-emerald-500 text-black font-bold py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50">
                    <Scissors size={18} /> {processing ? 'Processing...' : 'Download MP3'}
                </button>
                <button onClick={() => handleDownload('m4r')} disabled={processing} className="flex justify-center items-center gap-2 bg-neutral-800 text-white border border-neutral-700 font-bold py-3 rounded-xl hover:bg-neutral-700 disabled:opacity-50">
                    <Scissors size={18} /> {processing ? 'Processing...' : 'iPhone Audio'}
                </button>
            </div>

            {/* Styles for better Region Handles */}
            <style jsx global>{`
                .wavesurfer-region {
                    border: 1px solid rgba(244, 63, 94, 0.5) !important;
                    z-index: 10;
                }
                /* Custom Handles via pseudo elements on the region class if accessible, 
                   but standard WaveSurfer v7 regions handle interactions well without custom CSS handle hacks 
                   if we just ensure the hit area is good. The border helps. 
                */
            `}</style>
        </div>
    );
}
