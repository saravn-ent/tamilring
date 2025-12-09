'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Scissors, Loader2, Download, Music, Smartphone, AlertCircle } from 'lucide-react';
import AudioTrimmer from '@/components/AudioTrimmer';
import SectionHeader from '@/components/SectionHeader';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

export default function TrimPage() {
    const [file, setFile] = useState<File | null>(null);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(30);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    useEffect(() => {
        loadFFmpeg();
    }, []);

    const loadFFmpeg = async () => {
        if (ffmpegRef.current && ffmpegRef.current.loaded) return;

        try {
            const { FFmpeg } = await import('@ffmpeg/ffmpeg');
            const { toBlobURL } = await import('@ffmpeg/util');

            if (!ffmpegRef.current) {
                ffmpegRef.current = new FFmpeg();
            }

            const ffmpeg = ffmpegRef.current;
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setFfmpegLoaded(true);
        } catch (err) {
            console.error('Failed to load FFmpeg', err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setTrimStart(0);
            setTrimEnd(30);
        }
    };

    const handleTrimChange = (start: number, end: number) => {
        setTrimStart(start);
        setTrimEnd(end);
    };

    const downloadTrimmed = async (format: 'mp3' | 'm4r') => {
        if (!file || !ffmpegRef.current) return;

        setLoading(true);
        setLoadingMessage(`Generating ${format.toUpperCase()}...`);

        const ffmpeg = ffmpegRef.current;

        try {
            const { fetchFile } = await import('@ffmpeg/util');

            // Logging
            ffmpeg.on('log', ({ message }) => console.log(message));

            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'dat';
            const inputName = `input_${Date.now()}.${fileExt}`;
            const outputName = `trimmed_${Date.now()}.${format}`;

            await ffmpeg.writeFile(inputName, await fetchFile(file));

            const duration = trimEnd - trimStart;
            const ss = trimStart.toFixed(2);
            const t = duration.toFixed(2);

            let args: string[] = ['-ss', ss, '-i', inputName, '-t', t];

            if (format === 'm4r') {
                args = [...args, '-c:a', 'aac', '-b:a', '192k', '-vn', '-f', 'mp4', outputName];
            } else {
                args = [...args, '-c:a', 'libmp3lame', '-b:a', '320k', '-vn', '-f', 'mp3', outputName];
            }

            await ffmpeg.exec(args);

            const data = await ffmpeg.readFile(outputName);
            const blob = new Blob([data as any], { type: format === 'm4r' ? 'audio/x-m4r' : 'audio/mpeg' });

            // Trigger Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ringtone.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Cleanup
            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);

        } catch (error) {
            console.error('Conversion failed:', error);
            alert('Failed to process audio. Please try again.');
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className="max-w-xl mx-auto pb-24 px-4 pt-4">
            <SectionHeader title="Ringtone Cutter" />

            <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 mt-4 relative overflow-hidden shadow-2xl backdrop-blur-sm">

                {!file ? (
                    <div className="border-2 border-dashed border-neutral-700 rounded-2xl p-12 text-center hover:border-emerald-500 transition-all bg-black/20 group cursor-pointer active:scale-95 duration-200">
                        <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r" onChange={handleFileChange} className="hidden" id="audio-trim-upload" />
                        <label htmlFor="audio-trim-upload" className="cursor-pointer flex flex-col items-center gap-6">


                            <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center text-emerald-500 shadow-xl group-hover:scale-110 transition-transform duration-300 ring-4 ring-neutral-800 group-hover:ring-emerald-500/20">
                                <Scissors size={40} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-zinc-200 font-bold text-xl">Select Song</p>
                                <p className="text-zinc-500 text-sm">Tap to upload your audio file</p>
                            </div>
                            <div className="px-6 py-2.5 bg-emerald-500 text-black rounded-full text-sm font-bold mt-2 shadow-lg shadow-emerald-500/25">
                                Choose File
                            </div>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                                <div className="w-12 h-12 bg-emerald-500/10 flex items-center justify-center rounded-full text-emerald-500 shrink-0">
                                    <Music size={24} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-zinc-200 font-bold truncate text-base">{file.name}</p>
                                    <p className="text-xs text-zinc-500 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                            </div>

                            <button onClick={() => setFile(null)} className="w-full py-3 text-xs font-bold text-zinc-400 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl transition-colors border border-transparent hover:border-neutral-700">
                                Choose Different Song
                            </button>
                        </div>

                        <AudioTrimmer file={file} onTrimChange={handleTrimChange} />

                        <div className="flex flex-col items-center gap-1">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Selected Duration</p>
                            <p className={`font-mono font-bold text-4xl ${trimEnd - trimStart > 30 ? 'text-amber-500' : 'text-rose-500'}`}>
                                {(trimEnd - trimStart).toFixed(1)}<span className="text-lg text-rose-500/50 ml-1">sec</span>
                            </p>
                        </div>

                        {trimEnd - trimStart > 40 && (
                            <div className="flex items-center gap-3 p-4 bg-amber-500/10 text-amber-500 text-xs rounded-xl border border-amber-500/20">
                                <AlertCircle size={20} className="shrink-0" />
                                <span className="font-medium">Ringtones longer than 30s usually don't loop well. We recommend keeping it under 30s.</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <button
                                onClick={() => downloadTrimmed('mp3')}
                                disabled={loading || !ffmpegLoaded}
                                className="flex items-center justify-center gap-4 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white p-5 rounded-2xl border border-neutral-700 transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading && loadingMessage.includes('MP3') ? (
                                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                                ) : (
                                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                        <Download size={24} />
                                    </div>
                                )}
                                <div className="text-left">
                                    <span className="block text-sm font-bold">Download MP3</span>
                                    <span className="block text-[10px] text-zinc-500">Android / Standard</span>
                                </div>
                            </button>

                            <button
                                onClick={() => downloadTrimmed('m4r')}
                                disabled={loading || !ffmpegLoaded}
                                className="flex items-center justify-center gap-4 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white p-5 rounded-2xl border border-neutral-700 transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading && loadingMessage.includes('M4R') ? (
                                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                                ) : (
                                    <div className="bg-zinc-700/50 p-2 rounded-lg text-zinc-300 group-hover:bg-white group-hover:text-black transition-colors">
                                        <Smartphone size={24} />
                                    </div>
                                )}
                                <div className="text-left">
                                    <span className="block text-sm font-bold">Download M4R</span>
                                    <span className="block text-[10px] text-zinc-500">iPhone Ringtone</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center">
                <p className="text-zinc-500 text-xs max-w-xs mx-auto">
                    Processing happens locally in your browser. Your files are never sent to a server.
                </p>
            </div>
        </div>
    );
}
