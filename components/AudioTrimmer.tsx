'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, ZoomIn, ZoomOut, Scissors, RotateCcw } from 'lucide-react';

export default function AudioTrimmer({ file, onTrimChange }: { file: File, onTrimChange: (start: number, end: number) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<any>(null);
    const regionsRef = useRef<any>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [zoom, setZoom] = useState(0); // 0 = fit
    const [isReady, setIsReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        if (!containerRef.current || !file) return;

        let ws: any;
        const initWaveSurfer = async () => {
            const WaveSurfer = (await import('wavesurfer.js')).default;
            const RegionsPlugin = (await import('wavesurfer.js/dist/plugins/regions.esm.js')).default;

            if (wsRef.current) {
                wsRef.current.destroy();
            }

            ws = WaveSurfer.create({
                container: containerRef.current!,
                waveColor: '#3f3f46', // zinc-700 (darker base)
                progressColor: '#059669', // emerald-600 (played part)
                cursorColor: '#10b981',
                barWidth: 3,
                barGap: 3,
                barRadius: 3,
                height: 160, // Taller for better touch
                url: URL.createObjectURL(file),
                normalize: true,
                minPxPerSec: 0, // Allow fitting to screen
            });

            // Initialize Regions
            const wsRegions = ws.registerPlugin(RegionsPlugin.create());
            regionsRef.current = wsRegions;

            ws.on('decode', () => {
                setIsReady(true);
                const duration = ws.getDuration();
                const containerWidth = containerRef.current!.clientWidth;

                // Calculate zoom to fit entire song in view
                const fitZoom = containerWidth / duration;

                // Initial Default Region (30s centered)
                const start = Math.max(0, (duration / 2) - 15);
                const end = Math.min(start + 30, duration);

                wsRegions.addRegion({
                    start,
                    end,
                    color: 'rgba(244, 63, 94, 0.4)', // Rose-500
                    drag: true,
                    resize: true,
                });

                // Default to fitting the screen
                ws.zoom(fitZoom);
                setZoom(Math.floor(fitZoom));

                onTrimChange(start, end);
            });

            ws.on('timeupdate', (t: number) => {
                setCurrentTime(t);
            });

            ws.on('play', () => setIsPlaying(true));
            ws.on('pause', () => setIsPlaying(false));

            wsRegions.on('region-updated', (region: any) => {
                onTrimChange(region.start, region.end);
            });

            // Play region on click
            wsRegions.on('region-clicked', (region: any, e: any) => {
                e.stopPropagation();
                region.play();
            });
            // Loop region when playing
            wsRegions.on('region-out', (region: any) => {
                if (isPlaying) region.play();
            });

            wsRef.current = ws;
        };

        initWaveSurfer();

        return () => {
            if (ws) ws.destroy();
        };
    }, [file]);

    const togglePlay = () => {
        if (wsRef.current) {
            wsRef.current.playPause();
        }
    };

    const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        changeZoom(val);
    };

    const changeZoom = (val: number) => {
        // Enforce fit as minimum
        const duration = wsRef.current?.getDuration() || 1;
        const width = containerRef.current?.clientWidth || 100;
        const minZoom = width / duration;

        const newZoom = Math.max(minZoom, val);
        setZoom(newZoom);
        if (wsRef.current) wsRef.current.zoom(newZoom);
    };

    const fitToScreen = () => {
        if (wsRef.current) {
            const duration = wsRef.current.getDuration();
            const width = containerRef.current!.clientWidth;
            const fitZoom = width / duration;
            setZoom(fitZoom);
            wsRef.current.zoom(fitZoom);
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-black/40 rounded-2xl border border-white/5 p-4 space-y-6 select-none backdrop-blur-sm">

            {/* Waveform Container */}
            <div className="relative group">
                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-500 text-sm font-bold z-10 bg-black/50 rounded-xl">
                        Loading Waveform...
                    </div>
                )}

                {/* Time Indicator */}
                <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-mono border border-white/10">
                    {formatTime(currentTime)}
                </div>

                <div
                    ref={containerRef}
                    className={`rounded-xl overflow-hidden ${!isReady ? 'opacity-50' : 'opacity-100'} transition-opacity cursor-pointer`}
                />
            </div>

            {/* Main Controls */}
            <div className="flex flex-col gap-6">

                {/* Play/Pause & Time */}
                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={() => {
                            if (wsRef.current) {
                                wsRef.current.seekTo(0);
                                wsRef.current.play();
                            }
                        }}
                        className="p-3 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Restart"
                    >
                        <RotateCcw size={20} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                    </button>

                    <div className="text-center w-20">
                        {/* Placeholder for symmetry or secondary button */}
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Zoom</div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                            <button onClick={() => changeZoom(zoom - 10)} className="text-zinc-400 hover:text-emerald-500 p-1"><ZoomOut size={16} /></button>
                            <button onClick={() => changeZoom(zoom + 10)} className="text-zinc-400 hover:text-emerald-500 p-1"><ZoomIn size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Range Slider for Zoom (Secondary) */}
                <div className="flex items-center gap-3 px-2">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase">Detail</span>
                    <input
                        type="range"
                        min="0"
                        max="200"
                        value={zoom}
                        onChange={handleZoom}
                        className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <button onClick={fitToScreen} className="text-[10px] font-bold text-emerald-500 whitespace-nowrap hover:text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-md">
                        FIT VIEW
                    </button>
                </div>
            </div>

            <div className="text-xs text-zinc-500 text-center border-t border-white/5 pt-3">
                <span className="text-rose-500 font-bold">Tip: </span>
                Drag the highlighted rose box to select the ringtone part.
            </div>
        </div>
    );
}

// Global CSS styles for WaveSurfer regions handles to make them mobile friendly
// We can't easily inject this scoped, so we rely on global or style tag.
// Since we are in comp, maybe we just assume standard wavesurfer region handles are okay,
// but we really want them thicker.
