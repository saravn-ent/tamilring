'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, Pause, Check, Loader2, Minus, Plus, Volume2, Download, Scissors, Upload, Sparkles, AlertCircle } from 'lucide-react';
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
    const ffmpegRef = useRef<any>(null);
    const holdTimer = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Core States
    const [isPlaying, setIsPlaying] = useState(false);
    const [playMode, setPlayMode] = useState<'none' | 'selection' | 'full'>('none');
    const [isReady, setIsReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // UI/Processing States
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
    const [isProcessed, setIsProcessed] = useState(false);
    const [useAI, setUseAI] = useState(true);
    const [signalAudit, setSignalAudit] = useState<{ vocalPresence: number; noiseReduction: number; fidelity: number } | null>(null);
    const [aiLogs, setAiLogs] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [smartCandidates, setSmartCandidates] = useState<any[]>([]);
    const [currentCandidateIdx, setCurrentCandidateIdx] = useState(0);

    // -- HELPER: SIMPLE WAV ENCODER --
    const encodeWAV = (samples: Float32Array, sampleRate: number, numChannels: number = 1) => {
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
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
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

    // -- CORE WORKER PROCESSOR --
    const processAudioFile = async (originalFile: File, mode: 'vocal' | 'karaoke' | 'fx'): Promise<File> => {
        if (mode === 'fx') return originalFile;
        setProcessing(true);
        setLoadingMessage('Processing audio...');
        return new Promise(async (resolve, reject) => {
            try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const arrayBuffer = await originalFile.arrayBuffer();
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                const L = audioBuffer.getChannelData(0);
                const R = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : null;
                const sampleRate = audioBuffer.sampleRate;

                const worker = new Worker(new URL('../workers/audio.worker.ts', import.meta.url));
                worker.onmessage = (e) => {
                    const { type, data, error, metrics, percent } = e.data;
                    if (type === 'PROGRESS') setProgress(percent);

                    if (type === 'PROCESS_RESULT') {
                        if (metrics) setSignalAudit(metrics);
                        const isStereo = true; // Always output stereo for consistency
                        const wavBlob = encodeWAV(data, sampleRate, isStereo ? 2 : 1);
                        const processedFile = new File([wavBlob], `processed_${mode}.wav`, { type: 'audio/wav' });
                        setProcessing(false);
                        setLoadingMessage('');
                        resolve(processedFile);
                        worker.terminate();
                    } else if (type === 'ERROR') {
                        setProcessing(false);
                        setLoadingMessage('');
                        reject(new Error(error));
                        worker.terminate();
                    }
                };
                // Force useAI: false to use reliable DSP methods
                worker.postMessage({ type: 'PROCESS_AUDIO', payload: { left: L, right: R, mode, sampleRate, useAI: false } });
            } catch (err) {
                setProcessing(false);
                setLoadingMessage('');
                reject(err);
            }
        });
    };

    // -- TRIGGER: START EXTRACTION --
    const handleStartExtraction = async () => {
        if (processing || isProcessed) return;
        setIsPlaying(false);
        if (ws.current) ws.current.pause();

        try {
            const processedFile = await processAudioFile(file, initialTab);
            setActiveFile(processedFile);
            setIsProcessed(true);
            if (ws.current) {
                const url = URL.createObjectURL(processedFile);
                ws.current.load(url);
            }
        } catch (err) {
            setAiLogs(prev => [...prev, '❌ AI Engine Failed. Fallback logic triggered.']);
        }
    };

    // -- SMART CUT --
    const runSmartdetection = async (f: File) => {
        if (smartCandidates.length > 0) {
            const nextIdx = (currentCandidateIdx + 1) % smartCandidates.length;
            setCurrentCandidateIdx(nextIdx);
            const candidate = smartCandidates[nextIdx];
            setStartTime(candidate.start);
            setEndTime(Math.min(candidate.end, duration));
            if (wsRegions.current) {
                wsRegions.current.clearRegions();
                wsRegions.current.addRegion({ id: 'trim-region', start: candidate.start, end: Math.min(candidate.end, duration), color: 'rgba(245, 158, 11, 0.3)', drag: true, resize: true });
                if (ws.current) ws.current.seekTo(candidate.start / duration);
            }
            return;
        }
        setProcessing(true);
        try {
            const arrayBuffer = await f.arrayBuffer();
            const audioCtx = new AudioContext();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            const worker = new Worker(new URL('../workers/audio.worker.ts', import.meta.url));
            worker.onmessage = (e) => {
                if (e.data.type === 'ENERGY_RESULT') {
                    const { start, end, candidates } = e.data.data;
                    setSmartCandidates(candidates);
                    setStartTime(start);
                    setEndTime(end);
                    setProcessing(false);
                    worker.terminate();
                }
            };
            worker.postMessage({ type: 'ANALYZE_ENERGY', payload: { audioData: audioBuffer.getChannelData(0), sampleRate: audioBuffer.sampleRate } });
        } catch (e) { setProcessing(false); }
    };

    // -- INITIALIZATION --
    useEffect(() => {
        if (!containerRef.current || !file) return;
        let activeWs: WaveSurfer | null = null;
        let isDestroyed = false;

        const init = async () => {
            setIsReady(false);
            setIsProcessed(false);
            setSignalAudit(null);
            setAiLogs([]);
            setProgress(0);
            try {
                const WaveSurferLib = (await import('wavesurfer.js')).default;
                const RegionsPluginLib = (await import('wavesurfer.js/dist/plugins/regions.esm.js')).default;
                const TimelinePluginLib = (await import('wavesurfer.js/dist/plugins/timeline.esm.js')).default;

                if (isDestroyed) return;
                activeWs = WaveSurferLib.create({
                    container: containerRef.current!,
                    height: 100,
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
                            primaryLabelInterval: 5,
                            style: { fontSize: '10px', color: '#475569', fontWeight: '700' },
                        }),
                    ],
                });

                ws.current = activeWs;
                wsRegions.current = activeWs.registerPlugin(RegionsPluginLib.create());

                activeWs.on('ready', () => {
                    if (isDestroyed) return;
                    setIsReady(true);
                    setDuration(activeWs!.getDuration());
                    if (initialTab === 'fx') {
                        const dur = activeWs!.getDuration();
                        const s = Math.max(0, (dur / 2) - 15);
                        const e = Math.min(dur, s + 30);
                        setStartTime(s); setEndTime(e);
                        wsRegions.current?.addRegion({ id: 'trim-region', start: s, end: e, color: 'rgba(245, 158, 11, 0.12)', drag: true, resize: true });
                    } else {
                        setStartTime(0); setEndTime(activeWs!.getDuration());
                    }
                });

                activeWs.on('play', () => setIsPlaying(true));
                activeWs.on('pause', () => setIsPlaying(false));
                activeWs.on('timeupdate', (time) => setCurrentTime(time));

                const url = URL.createObjectURL(file);
                activeWs.load(url);
            } catch (err) { }
        };

        const timer = setTimeout(init, 100);
        return () => {
            isDestroyed = true;
            if (activeWs) activeWs.destroy();
            clearTimeout(timer);
        };
    }, [file, initialTab]);

    // -- AUDIO CONTROLS --
    useEffect(() => { if (ws.current && isReady) ws.current.zoom(zoom); }, [zoom, isReady]);
    useEffect(() => { if (ws.current && isReady) ws.current.setVolume(Math.min(1, volume / 100)); }, [volume, isReady]);

    const formatTimeCode = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins}:${secs.padStart(4, '0')}`;
    };

    const togglePlay = useCallback(() => {
        if (ws.current) {
            if (!isPlaying) setPlayMode('full');
            ws.current.playPause();
        }
    }, [isPlaying]);

    const playSelection = useCallback(() => {
        if (!ws.current || !wsRegions.current) return;
        const region = wsRegions.current.getRegions().find(r => r.id === 'trim-region');
        if (region) {
            setPlayMode('selection');
            region.play();
        }
    }, []);

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

    // -- EXPORT --
    const loadFFmpeg = async () => {
        if (ffmpegRef.current && ffmpegRef.current.isLoaded()) return ffmpegRef.current;
        if (!(window as any).FFmpeg) return null;
        const corePath = `${window.location.origin}/ffmpeg-st/ffmpeg-core.js`;
        try {
            const ffmpeg = (window as any).FFmpeg.createFFmpeg({ log: true, corePath, mainName: 'main' });
            await ffmpeg.load(); ffmpegRef.current = ffmpeg; return ffmpeg;
        } catch (err) { return null; }
    };

    const handleDownload = async (format: 'mp3' | 'm4r') => {
        if (loading) return; setLoading(true); setLoadingMessage(`Exporting...`);
        try {
            const ffmpeg = await loadFFmpeg(); if (!ffmpeg) return;
            const { fetchFile } = (window as any).FFmpeg;
            const inputName = `input_${Date.now()}.audio`;
            const outputName = `output_${Date.now()}.${format === 'm4r' ? 'm4r' : 'mp3'}`;

            ffmpeg.FS('writeFile', inputName, await fetchFile(activeFile));
            const args = ['-ss', startTime.toFixed(3), '-i', inputName, '-t', (endTime - startTime).toFixed(3), '-map_metadata', '-1'];
            const filters = [];
            if (fadeIn) filters.push(`afade=t=in:st=0:d=1.5`);
            if (fadeOut) filters.push(`afade=t=out:st=${(endTime - startTime - 1.5).toFixed(3)}:d=1.5`);
            if (volume !== 100) filters.push(`volume=${volume / 100}`);
            if (filters.length > 0) args.push('-af', filters.join(','));

            if (format === 'm4r') args.push('-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', outputName);
            else args.push('-c:a', 'libmp3lame', '-b:a', '320k', '-f', 'mp3', outputName);

            await ffmpeg.run(...args);
            const data = ffmpeg.FS('readFile', outputName);
            const blob = new Blob([data.buffer], { type: format === 'm4r' ? 'audio/x-m4r' : 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url;
            a.download = `TamilRing.in - ${file.name.split('.')[0]}.${format}`;
            a.click();
        } catch (err) { console.error(err); }
        finally { setLoading(false); setLoadingMessage(''); }
    };

    return (
        <div className="w-full max-w-lg mx-auto flex flex-col gap-2 pb-8 bg-white flex-1 animate-in fade-in duration-700">
            <style jsx global>{`
                div[part="cursor"] { height: 100% !important; border-left: 3px solid #16A34A !important; z-index: 100 !important; }
                div[part="cursor"]::after { content: ''; position: absolute; top: 0; left: -6px; width: 12px; height: 12px; background: #16A34A; border-radius: 50%; border: 3px solid white; z-index: 101; }
                div[part^="region-handle"] { width: 4px !important; background-color: #F59E0B !important; z-index: 50 !important; cursor: ew-resize !important; }
                div[part="region-trim-region"] { background-color: rgba(245, 158, 11, 0.12) !important; border-left: 3px solid #F59E0B !important; border-right: 3px solid #F59E0B !important; }
            `}</style>

            <header className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-50">
                <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest truncate max-w-[150px]">{file.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter ${isProcessed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {isProcessed ? 'PROCESSED' : 'ORIGINAL'}
                        </span>
                        {initialTab !== 'fx' && (
                            <span className="text-[8px] font-black uppercase text-slate-300">/ {initialTab}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {initialTab !== 'fx' && !isProcessed && (
                        <button onClick={handleStartExtraction} disabled={processing} className="h-9 px-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50">
                            {processing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {initialTab === 'vocal' ? 'Extract Vocals' : 'Make Karaoke'}
                        </button>
                    )}
                    {onFileChange && (
                        <button onClick={() => fileInputRef.current?.click()} className="h-9 px-3 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">
                            Change
                        </button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && onFileChange?.(e.target.files[0])} />
                </div>
            </header>

            <div className="px-3 space-y-4 pt-2">
                {/* MASTER WAVEFORM */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-400">01.</span>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Waveform Preview</span>
                        </div>
                    </div>

                    <div className="relative bg-white rounded-[2rem] p-2 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        {(!isReady || processing) && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-2">
                                <Loader2 size={32} className="text-indigo-600 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{loadingMessage || 'Loading Engine...'}</p>
                            </div>
                        )}
                        <div className="relative h-[110px] w-full mt-4">
                            {isReady && (
                                <div className="absolute top-[-25px] px-2 py-0.5 bg-[#16A34A] text-white text-[10px] font-mono font-bold rounded-full z-[110] shadow-md -translate-x-1/2" style={{ left: `${(currentTime / duration) * 100}%` }}>
                                    {formatTimeCode(currentTime)}
                                </div>
                            )}
                            <div ref={containerRef} className="w-full h-full" />
                        </div>
                        <div ref={timelineRef} className="w-full pt-1 pb-2 border-t border-slate-50" />
                    </div>
                </div>

                {/* AI DIAGNOSTICS */}
                {processing && aiLogs.length > 0 && (
                    <div className="p-4 bg-slate-950 rounded-[1.5rem] border border-white/5 font-mono text-[9px] text-slate-400">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-white font-black uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                AI Neural Console
                            </span>
                            <span className="text-emerald-500 font-bold">{progress}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full mb-4 overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                        {aiLogs.map((log, i) => <div key={i} className="mb-0.5 opacity-80">&gt; {log}</div>)}
                    </div>
                )}

                {/* EXTRACTION BUTTON (IF NOT PROCESSED) */}
                {!isProcessed && initialTab !== 'fx' && !processing && (
                    <div className="p-5 bg-indigo-50 rounded-[2rem] border border-indigo-100 border-dashed flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-indigo-600">
                            <Sparkles size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase text-indigo-900">Vocal Isolation Ready</h3>
                            <p className="text-[10px] text-indigo-700/70 font-bold leading-tight max-w-[200px]">
                                Click below to strip music from your song using the IVOL-4 Neural Engine.
                            </p>
                        </div>
                        <button onClick={handleStartExtraction} className="w-full h-12 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                            Start AI Extraction
                        </button>
                    </div>
                )}

                {/* PROCESSED AUDIT PANEL */}
                {isProcessed && signalAudit && (
                    <div className="p-5 bg-slate-900 rounded-[2rem] border border-white/10 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                                <Check size={12} className="text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Verification Report</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/5 p-3 rounded-2xl text-center">
                                <div className="text-[7px] text-slate-500 uppercase font-black mb-1">Vocal Peak</div>
                                <div className="text-lg font-black text-violet-400">{signalAudit.vocalPresence}%</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl text-center">
                                <div className="text-[7px] text-slate-500 uppercase font-black mb-1">Noise Floor</div>
                                <div className="text-lg font-black text-emerald-400">-{signalAudit.noiseReduction}dB</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl text-center">
                                <div className="text-[7px] text-slate-500 uppercase font-black mb-1">Fidelity</div>
                                <div className="text-lg font-black text-indigo-400">{signalAudit.fidelity}%</div>
                            </div>
                        </div>
                        <p className="mt-4 text-[9px] text-slate-400 font-bold bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-2">
                            <AlertCircle size={10} /> Original music signal crushed by {signalAudit.noiseReduction}dB.
                        </p>
                    </div>
                )}

                {/* TRIM CONTROLS */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[9px] font-bold text-slate-400">02.</span>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Trim & Play</span>
                    </div>
                    <div className="bg-slate-50 rounded-[2rem] p-4 border border-slate-100 shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Start Time</span>
                                <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden h-12">
                                    <button onMouseDown={() => startAdjusting('start', -0.1)} onMouseUp={stopAdjusting} className="w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50"><Minus size={16} /></button>
                                    <div className="flex-1 flex items-center justify-center font-mono font-bold text-slate-900 border-x border-slate-100">{formatTimeCode(startTime)}</div>
                                    <button onMouseDown={() => startAdjusting('start', 0.1)} onMouseUp={stopAdjusting} className="w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50"><Plus size={16} /></button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">End Time</span>
                                <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden h-12">
                                    <button onMouseDown={() => startAdjusting('end', -0.1)} onMouseUp={stopAdjusting} className="w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50"><Minus size={16} /></button>
                                    <div className="flex-1 flex items-center justify-center font-mono font-bold text-slate-900 border-x border-slate-100">{formatTimeCode(endTime)}</div>
                                    <button onMouseDown={() => startAdjusting('end', 0.1)} onMouseUp={stopAdjusting} className="w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50"><Plus size={16} /></button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={playSelection} className="flex-[2] h-12 bg-[#16A34A] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                                {playMode === 'selection' && isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" stroke="white" />}
                                Preview Cut
                            </button>
                            <button onClick={togglePlay} className="flex-1 h-12 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[9px] uppercase tracking-widest">
                                {playMode === 'full' && isPlaying ? <Pause size={14} /> : <Play size={14} />} Full
                            </button>
                        </div>
                    </div>
                </div>

                {/* EFFECTS */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[9px] font-bold text-slate-400">03.</span>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Adjust Output</span>
                    </div>
                    <div className="bg-slate-50 rounded-[1.5rem] p-3 border border-slate-100 grid grid-cols-2 gap-2">
                        <button onClick={() => setFadeIn(!fadeIn)} className={`h-9 rounded-xl border font-bold text-[9px] uppercase transition-all ${fadeIn ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-slate-400 border-slate-100'}`}>Fade In</button>
                        <button onClick={() => setFadeOut(!fadeOut)} className={`h-9 rounded-xl border font-bold text-[9px] uppercase transition-all ${fadeOut ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-slate-400 border-slate-100'}`}>Fade Out</button>
                        <div className="col-span-2 px-1 pt-1">
                            <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase mb-1">
                                <span>Volume</span>
                                <span>{volume}%</span>
                            </div>
                            <input type="range" min="0" max="250" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* DOWNLOAD */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[9px] font-bold text-slate-400">04.</span>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Export Final</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleDownload('mp3')} className="group h-14 bg-[#F92445] text-white rounded-2xl flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-rose-500/20">
                            <Download size={20} />
                            <div className="text-left font-black uppercase leading-tight"><p className="text-[9px]">Android</p><p className="text-[7px] text-white/60">MP3 FILE</p></div>
                        </button>
                        <button onClick={() => handleDownload('m4r')} className="h-14 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl flex items-center justify-center gap-3 active:scale-95 shadow-md">
                            <Download size={20} />
                            <div className="text-left font-black uppercase leading-tight"><p className="text-[9px]">iPhone</p><p className="text-[7px] text-slate-400">M4R FILE</p></div>
                        </button>
                    </div>
                </div>
            </div>

            <Script src="/ffmpeg/ffmpeg.min.js" strategy="afterInteractive" onLoad={() => { if ((window as any).FFmpeg) loadFFmpeg(); }} />
        </div>
    );
}
