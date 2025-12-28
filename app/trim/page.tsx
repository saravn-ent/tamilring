'use client';

import { useState } from 'react';
import { Scissors, Music, Youtube, Upload, ArrowLeft } from 'lucide-react';
import Script from 'next/script';

import dynamic from 'next/dynamic';

const AudioTrimmer = dynamic(() => import('@/components/AudioTrimmer'), {
    ssr: false,
    loading: () => <div className="p-12 text-center animate-pulse text-zinc-500">Initializing Audio Engine...</div>
});

export default function TrimPage() {
    const [file, setFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen pb-32">
            {/* FFmpeg Global Script */}
            <Script
                src="https://unpkg.com/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js"
                strategy="beforeInteractive"
            />

            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
                        <Scissors className="text-emerald-500" />
                        Ringtone Cutter
                    </h1>
                    <p className="text-zinc-400">
                        Create custom ringtones from your files or YouTube.
                    </p>
                </div>

                {!file ? (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                        {/* Tabs */}
                        <div className="grid grid-cols-2 border-b border-neutral-800">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`p-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'upload'
                                    ? 'bg-neutral-800 text-white'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-neutral-800/50'
                                    }`}
                            >
                                <Upload size={18} /> Upload File
                            </button>
                            <button
                                onClick={() => setActiveTab('youtube')}
                                className={`p-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'youtube'
                                    ? 'bg-neutral-800 text-white'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-neutral-800/50'
                                    }`}
                            >
                                <Youtube size={18} /> YouTube
                            </button>
                        </div>

                        <div className="p-8 min-h-[300px] flex flex-col justify-center">
                            {activeTab === 'upload' ? (
                                <div className="border-2 border-dashed border-neutral-700 rounded-xl p-10 text-center hover:border-emerald-500 transition-colors bg-black/20">
                                    <input
                                        type="file"
                                        accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="trim-upload"
                                    />
                                    <label htmlFor="trim-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                                            <Music size={40} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-white font-medium text-lg">Click to Upload Audio</p>
                                            <p className="text-zinc-500 text-sm">MP3, WAV, M4A supported</p>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="text-center space-y-4 py-10">
                                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-zinc-600">
                                        <Youtube size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-300">YouTube Import Coming Soon</h3>
                                        <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2">
                                            We are upgrading our YouTube importer to provide a faster and more reliable experience.
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-xs text-emerald-500 font-mono bg-emerald-500/10 px-3 py-1 rounded-full inline-block">
                                            ETA: Next Update
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => setFile(null)}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm font-medium transition-colors"
                        >
                            <ArrowLeft size={16} /> Cut Another Song
                        </button>

                        <AudioTrimmer file={file} />

                        <div className="text-center space-y-2">
                            <p className="text-xs text-zinc-600">
                                Processed securely in your browser. No data leaves your device.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
