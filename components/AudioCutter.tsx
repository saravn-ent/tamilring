'use client';
/** FINAL_COLOR_V2_YELLOW **/

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, Pause, ArrowLeft, Check, Loader2, Minus, Plus, Volume2, Download, Scissors, Upload, Sparkles } from 'lucide-react';
import Script from 'next/script';

// Dynamic Import Helper
import type WaveSurfer from 'wavesurfer.js';
import type RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';

interface AudioCutterProps {
    file: File;
    initialTab: 'fx' | 'vocal' | 'karaoke';
    onReset?: () => void;
    onFileChange?: (file: File) => void;
}

export default function AudioCutter({ file, initialTab, onReset, onFileChange }: AudioCutterProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const ws = useRef<WaveSurfer | null>(null);
    const wsRegions = useRef<RegionsPlugin | null>(null);
    const ffmpegRef = useRef<any>(null); // External lib
    const holdTimer = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [playMode, setPlayMode] = useState<'none' | 'selection' | 'full'>('none');
    const [isReady, setIsReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [volume, setVolume] = useState(100);
    const [fadeIn, setFadeIn] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [zoom, setZoom] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [activeFile, setActiveFile] = useState<File>(file);
    const [isTrimActive, setIsTrimActive] = useState(initialTab === 'fx');

    // -- HELPER: SIMPLE WAV ENCODER --
    const encodeWAV = (samples: Float32Array, sampleRate: number) => {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);
        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples.length * 2, true);

        const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
            for (let i = 0; i < input.length; i++, offset += 2) {
                const s = Math.max(-1, Math.min(1, input[i]));
                output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        };

        floatTo16BitPCM(view, 44, samples);
        return new Blob([view], { type: 'audio/wav' });
    };

    const processAudioFile = async (originalFile: File, mode: 'vocal' | 'karaoke' | 'fx'): Promise<File> => {
        if (mode === 'fx') return originalFile;

        setProcessing(true);
        setLoadingMessage('Initializing AI isolation...');

        return new Promise(async (resolve, reject) => {
            try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const arrayBuffer = await originalFile.arrayBuffer();

                setLoadingMessage('Decoding high-quality stream...');
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

                const L = audioBuffer.getChannelData(0);
                const R = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : null;
                const sampleRate = audioBuffer.sampleRate;

                setLoadingMessage('Separating audio layers (AI)...');
                const worker = new Worker(new URL('../workers/audio.worker.ts', import.meta.url));

                worker.onmessage = (e) => {
                    const { type, data, error } = e.data;
                    if (type === 'PROCESS_RESULT') {
                        setLoadingMessage('Finalizing results...');
                        const wavBlob = encodeWAV(data, sampleRate);
                        resolve(new File([wavBlob], `processed_${mode}.wav`, { type: 'audio/wav' }));
                        worker.terminate();
                    } else if (type === 'ERROR') {
                        reject(new Error(error));
                        worker.terminate();
                    }
                };

                worker.onerror = (err) => {
                    reject(new Error("Worker thread failed"));
                    worker.terminate();
                };

                worker.postMessage({
                    type: 'PROCESS_AUDIO',
                    payload: { left: L, right: R, mode, sampleRate }
                });

            } catch (err) {
                console.error("Audio Processing Error:", err);
                reject(err);
            } finally {
                setProcessing(false);
                setLoadingMessage('');
            }
        });
    };

    const [smartCandidates, setSmartCandidates] = useState<any[]>([]);
    const [currentCandidateIdx, setCurrentCandidateIdx] = useState(0);

    const runSmartdetection = async (file: File) => {
        if (smartCandidates.length > 0) {
            const nextIdx = (currentCandidateIdx + 1) % smartCandidates.length;
            setCurrentCandidateIdx(nextIdx);
            const candidate = smartCandidates[nextIdx];
            setStartTime(candidate.start);
            setEndTime(Math.min(candidate.end, duration));
            if (wsRegions.current) {
                wsRegions.current.clearRegions();
                wsRegions.current.addRegion({
                    id: 'trim-region',
                    start: candidate.start,
                    end: Math.min(candidate.end, duration),
                    color: 'rgba(234, 179, 8, 0.3)',
                    drag: true,
                    resize: true,
                });
                if (ws.current && duration > 0) ws.current.seekTo(candidate.start / duration);
            }
            return;
        }

        setLoadingMessage('AI analyzing song structure...');
        setProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            const rawData = audioBuffer.getChannelData(0);
            const worker = new Worker(new URL('../workers/audio.worker.ts', import.meta.url));

            worker.onmessage = (e) => {
                const { type, data } = e.data;
                if (type === 'ENERGY_RESULT') {
                    const { start, end, candidates } = data;
                    if (candidates && candidates.length > 0) {
                        setSmartCandidates(candidates);
                        setCurrentCandidateIdx(0);
                    }
                    setStartTime(start);
                    setEndTime(Math.min(audioBuffer.duration, end));
                    if (wsRegions.current) {
                        wsRegions.current.clearRegions();
                        wsRegions.current.addRegion({
                            id: 'trim-region',
                            start: start,
                            end: Math.min(audioBuffer.duration, end),
                            color: 'rgba(234, 179, 8, 0.3)',
                            drag: true,
                            resize: true,
                        });
                        if (ws.current && audioBuffer.duration > 0) ws.current.seekTo(start / audioBuffer.duration);
                    }
                    setProcessing(false);
                    setLoadingMessage('');
                    worker.terminate();
                }
            };
            worker.postMessage({ type: 'ANALYZE_ENERGY', payload: { audioData: rawData, sampleRate: audioBuffer.sampleRate } });
        } catch (e) {
            setProcessing(false);
            setLoadingMessage('');
        }
    };

    useEffect(() => {
        if (!containerRef.current || !file) return;
        let activeWs: WaveSurfer | null = null;
        let isDestroyed = false;

        const init = async () => {
            setSmartCandidates([]);
            setCurrentCandidateIdx(0);
            try {
                const fileToLoad = await processAudioFile(file, initialTab);
                if (isDestroyed) return;
                setActiveFile(fileToLoad);
                const WaveSurferLib = (await import('wavesurfer.js')).default;
                const RegionsPluginLib = (await import('wavesurfer.js/dist/plugins/regions.esm.js')).default;
                const TimelinePluginLib = (await import('wavesurfer.js/dist/plugins/timeline.esm.js')).default;
                const url = URL.createObjectURL(fileToLoad);

                activeWs = WaveSurferLib.create({
                    container: containerRef.current!,
                    height: 120,
                    waveColor: '#E5E7EB',
                    progressColor: '#381C75',
                    cursorColor: '#16A34A',
                    cursorWidth: 3,
                    barWidth: 2,
                    barGap: 3,
                    barRadius: 2,
                    normalize: true,
                    minPxPerSec: 10,
                    fillParent: true,
                    plugins: [
                        TimelinePluginLib.create({
                            container: timelineRef.current!,
                            primaryLabelInterval: 10,
                            style: { fontSize: '10px', color: '#64748B', fontWeight: '600' },
                        }),
                    ],
                });

                ws.current = activeWs;
                wsRegions.current = activeWs.registerPlugin(RegionsPluginLib.create());
                activeWs.on('ready', () => {
                    const dur = activeWs!.getDuration();
                    setIsReady(true);
                    setDuration(dur);
                    activeWs!.setVolume(Math.min(1, volume / 100));
                    if (initialTab === 'fx') {
                        const s = Math.max(0, (dur / 2) - 15);
                        const e = Math.min(dur, s + 30);
                        setStartTime(s); setEndTime(e);
                        wsRegions.current?.addRegion({ id: 'trim-region', start: s, end: e, color: 'rgba(234, 179, 8, 0.12)', drag: true, resize: true });
                    } else {
                        setStartTime(0); setEndTime(dur);
                    }
                });
                wsRegions.current?.on('region-updated', (region) => { setStartTime(region.start); setEndTime(region.end); });
                activeWs.on('play', () => setIsPlaying(true));
                activeWs.on('pause', () => { setIsPlaying(false); setPlayMode('none'); });
                activeWs.on('timeupdate', (time) => setCurrentTime(time));
                activeWs.load(url);
            } catch (err) {
                setLoadingMessage("Failed to Load.");
            }
        };

        const timer = setTimeout(init, 100);
        return () => { clearTimeout(timer); isDestroyed = true; if (activeWs) activeWs.destroy(); if (holdTimer.current) clearInterval(holdTimer.current); };
    }, [file]);

    useEffect(() => { if (ws.current && isReady) ws.current.zoom(zoom); }, [zoom, isReady]);
    useEffect(() => { if (ws.current && isReady) ws.current.setVolume(Math.min(1, volume / 100)); }, [volume, isReady]);

    const formatTimeCode = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins}:${secs.padStart(4, '0')}`;
    };

    const togglePlay = useCallback(async () => {
        if (ws.current) {
            const deck = (ws.current as any).backend?.getAudioContext?.();
            if (deck?.state === 'suspended') await deck.resume();
            if (!isPlaying) setPlayMode('full');
            ws.current.playPause();
        }
    }, [isPlaying]);

    const playSelection = useCallback(async () => {
        if (!ws.current || !wsRegions.current) return;
        const region = wsRegions.current.getRegions().find(r => r.id === 'trim-region');
        if (region) {
            const deck = (ws.current as any).backend?.getAudioContext?.();
            if (deck?.state === 'suspended') await deck.resume();
            if (isPlaying) { ws.current.pause(); setPlayMode('none'); }
            else { setPlayMode('selection'); region.play(); }
        }
    }, [isPlaying]);

    const modifyTime = useCallback((type: 'start' | 'end', delta: number) => {
        const region = wsRegions.current?.getRegions().find(r => r.id === 'trim-region');
        if (!region) return;
        if (type === 'start') {
            setStartTime(prev => {
                const newStart = Math.max(0, Math.min(endTime - 0.5, prev + delta));
                (region as any).setOptions({ start: newStart }); return newStart;
            });
        } else {
            setEndTime(prev => {
                const newEnd = Math.max(startTime + 0.5, Math.min(duration, prev + delta));
                (region as any).setOptions({ end: newEnd }); return newEnd;
            });
        }
    }, [endTime, startTime, duration]);

    const startAdjusting = (type: 'start' | 'end', delta: number) => {
        modifyTime(type, delta);
        if (holdTimer.current) clearInterval(holdTimer.current);
        holdTimer.current = setInterval(() => modifyTime(type, delta), 100);
    };

    const stopAdjusting = () => { if (holdTimer.current) { clearInterval(holdTimer.current); holdTimer.current = null; } };

    const loadFFmpeg = async () => {
        if (ffmpegRef.current && ffmpegRef.current.isLoaded()) return ffmpegRef.current;
        if (!(window as any).FFmpeg) return null;
        const corePath = `${window.location.origin}/ffmpeg-st/ffmpeg-core.js`;
        try {
            const ffmpeg = (window as any).FFmpeg.createFFmpeg({ log: true, corePath, mainName: 'main' });
            await ffmpeg.load(); ffmpegRef.current = ffmpeg; return ffmpeg;
        } catch (err) { return null; }
    };

    const convertAudio = async (inputFile: File, startTime: number, clipDuration: number, format: 'mp3' | 'm4r'): Promise<Blob | null> => {
        const ffmpeg = await loadFFmpeg(); if (!ffmpeg) return null;
        const { fetchFile } = (window as any).FFmpeg;
        const inputName = `input_${Date.now()}.audio`;
        const outputExt = format === 'm4r' ? 'm4r' : 'mp3';
        const outputName = `output_${Date.now()}.${outputExt}`;
        try {
            ffmpeg.FS('writeFile', inputName, await fetchFile(inputFile));
            const args = ['-ss', startTime.toFixed(3), '-i', inputName, '-t', clipDuration.toFixed(3), '-map_metadata', '-1'];
            const filters = [];
            if (fadeIn) filters.push(`afade=t=in:st=0:d=1.5`);
            if (fadeOut) filters.push(`afade=t=out:st=${(clipDuration - 1.5).toFixed(3)}:d=1.5`);
            if (volume !== 100) filters.push(`volume=${volume / 100}`);
            if (filters.length > 0) args.push('-af', filters.join(','));
            if (format === 'm4r') args.push('-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-f', 'mp4', outputName);
            else args.push('-c:a', 'libmp3lame', '-b:a', '320k', '-f', 'mp3', outputName);
            await ffmpeg.run(...args);
        } catch (e: any) {
            // FFmpeg.wasm throws an "ExitStatus" error on completion in many versions.
            // If it's exit(0), it's a success.
            if (e && (e.message?.includes('exit(0)') || e.name === 'ExitStatus')) {
                // Ignore clean exit
            } else {
                throw e;
            }
        }
        try {
            const data = ffmpeg.FS('readFile', outputName);
            return new Blob([data.buffer], { type: format === 'm4r' ? 'audio/x-m4r' : 'audio/mpeg' });
        } catch (err) {
            console.error("CONVERSION_RESULT_ERROR:", err);
            return null;
        } finally {
            try { ffmpeg.FS('unlink', inputName); ffmpeg.FS('unlink', outputName); } catch (e) { }
        }
    };

    const handleDownload = async (format: 'mp3' | 'm4r') => {
        if (loading) return; setLoading(true); setLoadingMessage(`Exporting ${format.toUpperCase()}...`);
        try {
            const blob = await convertAudio(activeFile, startTime, endTime - startTime, format);
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url;
                const cleanInputName = file.name.split('.')[0].replace(/_/g, ' ').trim();
                a.download = `TamilRing.in - ${cleanInputName}.${format === 'm4r' ? 'm4r' : 'mp3'}`;
                a.click();
            }
        } finally { setLoading(false); setLoadingMessage(''); }
    };

    const enableTrim = () => {
        if (!ws.current || !wsRegions.current) return;
        const dur = ws.current.getDuration();
        const s = Math.max(0, (dur / 2) - 15);
        const e = Math.min(dur, s + 30);
        setIsTrimActive(true); setStartTime(s); setEndTime(e);
        wsRegions.current.addRegion({ id: 'trim-region', start: s, end: e, color: 'rgba(234, 179, 8, 0.12)', drag: true, resize: true });
    };

    return (
        <div className="w-full max-w-lg mx-auto flex flex-col gap-2 md:gap-3 pb-8 bg-white flex-1 animate-in fade-in duration-700">
            <style jsx global>{`
                div[part="cursor"] { height: 100% !important; border-left: 3px solid #16A34A !important; z-index: 100 !important; }
                div[part="cursor"]::after { content: ''; position: absolute; top: 0; left: -6px; width: 12px; height: 12px; background: #16A34A; border-radius: 50%; border: 3px solid white; z-index: 101; }
                div[part^="region-handle"] { width: 4px !important; background-color: #EAB308 !important; top: 0 !important; height: 100% !important; z-index: 50 !important; cursor: ew-resize !important; }
                div[part="region-trim-region"] { background-color: rgba(234, 179, 8, 0.12) !important; border-left: 3px solid #EAB308 !important; border-right: 3px solid #EAB308 !important; }
            `}</style>

            <header className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-start justify-center">
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest truncate max-w-[200px]">{file.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {onFileChange && (
                        <>
                            <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r,.ogg" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) onFileChange(e.target.files[0]); }} />
                            <button onClick={() => fileInputRef.current?.click()} className="h-8 px-3 bg-[#F5F3F9] text-[#F92445] rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#E6E1F0] transition-colors flex items-center gap-2">
                                <Upload size={12} /> Change Song
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="px-2 sm:px-3 space-y-2">
                {/* STEP 1: PREVIEW & ZOOM */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-bold text-slate-400">01.</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Preview & Zoom</span>
                    </div>
                    <div className="space-y-2">
                        <div className="relative bg-white rounded-2xl p-2 sm:p-3 pt-6 sm:pt-8 border border-slate-100 overflow-hidden shadow-sm">
                            {/* FLOATING TIME HUD */}
                            {isReady && duration > 0 && (
                                <div
                                    className="absolute top-2 px-2 py-0.5 bg-white text-[#16A34A] text-[10px] font-mono font-bold rounded z-[110] transition-all pointer-events-none -translate-x-1/2 flex items-center gap-1 border border-[#16A34A]/20"
                                    style={{ left: `${(currentTime / duration) * 100}%` }}
                                >
                                    <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
                                    {formatTimeCode(currentTime)}
                                </div>
                            )}

                            {/* PROCESSING OVERLAY */}
                            {(processing || !isReady) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-[2px] z-50 animate-in fade-in duration-300">
                                    <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-white shadow-xl border border-slate-100">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-[#F92445]/20 rounded-full animate-ping" />
                                            <Loader2 className="w-10 h-10 animate-spin text-[#F92445] relative z-10" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F92445] mb-1">
                                                {loadingMessage || (isReady ? 'Processing...' : 'Loading Song...')}
                                            </p>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                                Please stay on this page
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="relative h-32 w-full mb-2">
                                <div ref={containerRef} className="w-full h-full" />
                            </div>
                            <div ref={timelineRef} className="w-full" />
                        </div>

                        {/* ZOOM */}
                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Zoom Level</span>
                            <input type="range" min="0" max="200" step="1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#F92445]" />
                        </div>
                    </div>
                </div>

                {/* STEP 2: SELECT & LISTEN */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-bold text-slate-400">02.</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Trim & Play</span>
                    </div>
                    <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm space-y-3">
                        {isTrimActive ? (
                            <>
                                {/* 1st Line: AUTO DETECT + SECONDS */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => runSmartdetection(activeFile)}
                                        className="flex-1 h-12 bg-[#F5F3F9] text-[#F92445] rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#E6E1F0] transition-colors border border-[#E6E1F0] shadow-sm"
                                    >
                                        <Sparkles size={14} /> {smartCandidates.length > 0 ? `Try Next Part (${currentCandidateIdx + 1}/${smartCandidates.length})` : 'Auto-Detect Highlights'}
                                    </button>
                                    <div className="h-12 px-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                                        <span className="text-[11px] font-mono font-bold text-slate-600">{formatTimeCode(endTime - startTime)}</span>
                                    </div>
                                </div>

                                {/* 2nd Line: START & END TIME CONTROLLER */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Beginning</span>
                                        <div className="text-lg font-mono font-bold text-[#381C75]">{formatTimeCode(startTime)}</div>
                                        <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden">
                                            <button onMouseDown={() => startAdjusting('start', -0.1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} onTouchStart={() => startAdjusting('start', -0.1)} onTouchEnd={stopAdjusting} className="flex-1 py-1.5 flex items-center justify-center text-[#381C75]/60 hover:text-[#381C75] hover:bg-slate-50 transition-colors">
                                                <Minus size={14} />
                                            </button>
                                            <div className="w-px bg-slate-200" />
                                            <button onMouseDown={() => startAdjusting('start', 0.1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} onTouchStart={() => startAdjusting('start', 0.1)} onTouchEnd={stopAdjusting} className="flex-1 py-1.5 flex items-center justify-center text-[#381C75]/60 hover:text-[#381C75] hover:bg-slate-50 transition-colors">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End Point</span>
                                        <div className="text-lg font-mono font-bold text-[#381C75]">{formatTimeCode(endTime)}</div>
                                        <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden">
                                            <button onMouseDown={() => startAdjusting('end', -0.1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} onTouchStart={() => startAdjusting('end', -0.1)} onTouchEnd={stopAdjusting} className="flex-1 py-1.5 flex items-center justify-center text-[#381C75]/60 hover:text-[#381C75] hover:bg-slate-50 transition-colors">
                                                <Minus size={14} />
                                            </button>
                                            <div className="w-px bg-slate-200" />
                                            <button onMouseDown={() => startAdjusting('end', 0.1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting} onTouchStart={() => startAdjusting('end', 0.1)} onTouchEnd={stopAdjusting} className="flex-1 py-1.5 flex items-center justify-center text-[#381C75]/60 hover:text-[#381C75] hover:bg-slate-50 transition-colors">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 3rd Line: PREVIEW CUT & FULL SONG BUTTON */}
                                <div className="flex items-center gap-2 pt-2">
                                    <button onClick={playSelection} className={`flex-[2] h-14 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-wider transition-all shadow-lg ${playMode === 'selection' && isPlaying ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-[#16A34A] text-white shadow-green-500/20 active:scale-95'}`}>
                                        {playMode === 'selection' && isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" stroke="white" />}
                                        Preview Cut
                                    </button>
                                    <button onClick={togglePlay} className={`flex-1 h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-wider transition-all border-2 ${playMode === 'full' && isPlaying ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                                        {playMode === 'full' && isPlaying ? <Pause size={14} /> : <Play size={14} />} Full Song
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={enableTrim} className="py-3 bg-[#F5F3F9] text-[#F92445] rounded-xl border border-[#E6E1F0] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#E6E1F0] transition-colors">
                                        <Scissors size={14} /> Manual Trim
                                    </button>
                                    <button onClick={() => { enableTrim(); runSmartdetection(activeFile); }} className="py-3 bg-[#F92445] text-white rounded-xl border border-[#F92445] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#F92445]/90 transition-colors shadow-lg shadow-rose-500/20">
                                        <Sparkles size={14} /> Auto Cut
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <button onClick={togglePlay} className="w-full h-14 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-wider transition-all bg-[#16A34A] text-white shadow-lg shadow-green-500/20 active:scale-95">
                                        {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" stroke="white" />}
                                        Play Audio
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* STEP 3: ADJUST SOUND */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-bold text-slate-400">03.</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Adjust Sound</span>
                    </div>
                    <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 space-y-3 shadow-sm">
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setFadeIn(!fadeIn)} className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase transition-all ${fadeIn ? 'border-[#F92445] bg-[#F92445] text-white' : 'border-slate-200 text-slate-400 bg-white hover:bg-slate-50'}`}>{fadeIn && <Check size={14} />} Auto Fade In</button>
                            <button onClick={() => setFadeOut(!fadeOut)} className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase transition-all ${fadeOut ? 'border-[#F92445] bg-[#F92445] text-white' : 'border-slate-200 text-slate-400 bg-white hover:bg-slate-50'}`}>{fadeOut && <Check size={14} />} Auto Fade Out</button>
                        </div>
                        <div className="space-y-2 px-1">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                                <div className="flex items-center gap-2"><Volume2 size={14} /> Output Volume</div>
                                <span className="font-mono text-xs" style={{ color: '#F92445' }}>{volume}%</span>
                            </div>
                            <input type="range" min="0" max="200" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-full appearance-none accent-[#F92445] cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* STEP 4: DOWNLOAD */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-bold text-slate-400">04.</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Download File</span>
                    </div>
                    <div className="pt-1">
                        {loading ? (
                            <div className="w-full h-16 bg-white border-2 border-[#16A34A] rounded-2xl flex items-center justify-center gap-4 text-[#16A34A] animate-pulse">
                                <Loader2 size={24} className="animate-spin" />
                                <span className="text-[11px] font-black uppercase tracking-widest">{loadingMessage || 'Generating File...'}</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => handleDownload('mp3')} className="group h-16 bg-[#F92445] text-white rounded-2xl flex items-center justify-center gap-4 hover:bg-[#F92445]/90 transition-all active:scale-95 shadow-lg shadow-rose-500/20">
                                    <Download className="group-hover:animate-bounce w-6 h-6" />
                                    <div className="text-left"><p className="text-[10px] font-black uppercase tracking-widest leading-none">Android</p><p className="text-white/70 text-[8px] mt-1 font-bold">MP3 FILE</p></div>
                                </button>
                                <button onClick={() => handleDownload('m4r')} className="group h-16 bg-white border-2 border-[#F92445] text-[#F92445] rounded-2xl flex items-center justify-center gap-4 hover:bg-red-50 transition-all active:scale-95 shadow-sm">
                                    <Download className="group-hover:animate-bounce w-6 h-6" />
                                    <div className="text-left"><p className="text-[10px] font-black uppercase tracking-widest leading-none">iPhone</p><p className="text-[#F92445]/60 text-[8px] mt-1 font-bold">M4R FILE</p></div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* STEP 5: SHARE & POST */}
                <div className="space-y-3 pb-8">
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-bold text-slate-400">05.</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Share with Others</span>
                    </div>
                    <div className="p-4 bg-[#F5F3F9] border border-[#E6E1F0] rounded-2xl flex flex-col items-center text-center gap-3 shadow-sm">
                        <div className="space-y-1">
                            <h4 className="text-[12px] font-black uppercase text-[#381C75] tracking-tight">Post to TamilRing</h4>
                            <p className="text-[10px] text-[#381C75]/70 font-medium">Share your custom ringtone with the community!</p>
                        </div>
                        <Link href="/profile" className="w-full">
                            <button className="w-full py-3 bg-[#381C75] text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#381C75]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-dark/20">
                                <Upload size={14} /> Upload Ringtone
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <Script src="/ffmpeg/ffmpeg.min.js" strategy="afterInteractive" onLoad={() => { if ((window as any).FFmpeg) loadFFmpeg(); }} />
        </div>
    );
}
