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
    const [localStart, setLocalStart] = useState(0);
    const [localEnd, setLocalEnd] = useState(30);

    const updateRegion = (start: number, end: number) => {
        if (!regionsRef.current) return;
        regionsRef.current.clearRegions();
        regionsRef.current.addRegion({
            start,
            end,
            color: 'rgba(244, 63, 94, 0.4)',
            drag: true,
            resize: true
        });
        onTrimChange(start, end);
    };

    useEffect(() => {
        if (!containerRef.current || !file) return;

        let ws: any;
        const initWaveSurfer = async () => {
            try {
                const WaveSurferModule = await import('wavesurfer.js');
                const WaveSurfer = WaveSurferModule.default || WaveSurferModule;

                const RegionsPluginModule = await import('wavesurfer.js/dist/plugins/regions.esm.js');
                const RegionsPlugin = RegionsPluginModule.default || RegionsPluginModule;

                if (wsRef.current) {
                    wsRef.current.destroy();
                }

                ws = WaveSurfer.create({
                    container: containerRef.current!,
                    waveColor: '#3f3f46',
                    progressColor: '#059669',
                    cursorColor: '#10b981',
                    barWidth: 3,
                    barGap: 3,
                    barRadius: 3,
                    height: 160,
                    url: URL.createObjectURL(file), // Helper to create blob URL
                    normalize: true,
                    minPxPerSec: 0,
                });

                // Initialize Regions
                const wsRegions = ws.registerPlugin(RegionsPlugin.create());
                regionsRef.current = wsRegions;

                // Event: Decoded (Waveform ready)
                ws.on('decode', () => {
                    setIsReady(true);
                    setupDefaultRegion(ws, wsRegions);
                });

                // Event: Ready (Fallback if decode doesn't trigger for some reason)
                ws.on('ready', () => {
                    if (!isReady) setIsReady(true);
                });

                // Event: Error
                ws.on('error', (e: any) => {
                    console.error("WaveSurfer Error:", e);
                    // Force ready so user isn't stuck, but maybe show error
                    setIsReady(true);
                });

                ws.on('timeupdate', (t: number) => {
                    setCurrentTime(t);
                });

                ws.on('play', () => setIsPlaying(true));
                ws.on('pause', () => setIsPlaying(false));

                wsRegions.on('region-updated', (region: any) => {
                    onTrimChange(region.start, region.end);
                    setLocalStart(region.start);
                    setLocalEnd(region.end);
                });

                wsRegions.on('region-clicked', (region: any, e: any) => {
                    e.stopPropagation();
                    region.play();
                });

                wsRegions.on('region-out', (region: any) => {
                    if (isPlaying) region.play();
                });

                wsRef.current = ws;
            } catch (err) {
                console.error("WaveSurfer Init Error:", err);
            }
        };

        initWaveSurfer();

        return () => {
            if (ws) ws.destroy();
        };
    }, [file]);

    const setupDefaultRegion = (ws: any, wsRegions: any) => {
        setTimeout(() => {
            try {
                if (!ws || !ws.backend || ws.isDestroyed) return;

                // Debug Log
                console.log("Setting up default region...", ws.getDuration());

                // Prevent double init
                if (wsRegions.getRegions().length > 0) {
                    console.log("Region already exists:", wsRegions.getRegions());
                    return;
                }

                const duration = ws.getDuration() || 30; // Fallback

                // Center 30s
                const start = Math.max(0, (duration / 2) - 15);
                const end = Math.min(start + 30, duration);

                console.log(`Adding region: ${start} - ${end}`);

                const r = wsRegions.addRegion({
                    start,
                    end,
                    color: 'rgba(244, 63, 94, 0.4)',
                    drag: true,
                    resize: true,
                    content: 'Drag me'
                });

                console.log("Region added:", r);

                // Enable drawing just in case
                wsRegions.enableDragSelection({
                    color: 'rgba(244, 63, 94, 0.4)',
                });

                // Zoom logic
                const containerWidth = containerRef.current!.clientWidth;
                const fitZoom = containerWidth / duration;
                ws.zoom(fitZoom);
                setZoom(Math.floor(fitZoom));
                setZoom(Math.floor(fitZoom));
                onTrimChange(start, end);
                setLocalStart(start);
                setLocalEnd(end);

            } catch (e) {
                console.error("WaveSurfer region setup error:", e);
            }
        }, 100); // Small delay to ensure DOM is ready
    };

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

            {/* Manual Trim Controls (Prominent) */}
            <div className="flex items-center justify-between gap-4 bg-neutral-800/50 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Start (0.0s)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        className="w-24 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-center text-lg font-mono font-bold text-white focus:border-emerald-500 outline-none"
                        value={localStart.toFixed(1)}
                        onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setLocalStart(val);
                            updateRegion(val, localEnd);
                        }}
                    />
                </div>

                <div className="text-zinc-500 font-mono text-xs">TO</div>

                <div className="flex flex-col items-end">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1">End (30.0s)</label>
                    <input
                        type="number"
                        step="0.1"
                        className="w-24 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-center text-lg font-mono font-bold text-white focus:border-emerald-500 outline-none"
                        value={localEnd.toFixed(1)}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setLocalEnd(val);
                            updateRegion(localStart, val);
                        }}
                    />
                </div>
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



            <style jsx global>{`
                div[part="region"] {
                    z-index: 99 !important;
                    background-color: rgba(244, 63, 94, 0.4) !important;
                    border: 1px solid rgba(244, 63, 94, 0.8) !important;
                }
                .wavesurfer-region {
                    z-index: 99 !important;
                    position: absolute !important;
                    height: 100% !important;
                    background-color: rgba(244, 63, 94, 0.4) !important;
                }
            `}</style>
        </div>
    );
}

// Global CSS styles for WaveSurfer regions handles to make them mobile friendly
// We can't easily inject this scoped, so we rely on global or style tag.
// Since we are in comp, maybe we just assume standard wavesurfer region handles are okay,
// but we really want them thicker.
