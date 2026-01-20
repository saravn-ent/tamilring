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
        <div className="container mx-auto px-4 py-8 min-h-screen pb-32 bg-white">
            {/* FFmpeg Global Script */}
            <Script
                src="https://unpkg.com/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js"
                strategy="beforeInteractive"
            />

            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-2 text-center">
                    <h1 className="text-4xl font-black text-brand-dark flex items-center justify-center gap-3 tracking-tight">
                        <Scissors className="text-brand-accent" strokeWidth={3} />
                        Ringtone Cutter
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        Create custom ringtones from your files or YouTube.
                    </p>
                </div>

                {!file ? (
                    <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-2xl shadow-brand-dark/10">
                        {/* Tabs */}
                        <div className="grid grid-cols-2 border-b border-brand-border">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`p-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'upload'
                                    ? 'bg-brand-wash text-brand-dark border-b-2 border-brand-dark'
                                    : 'text-zinc-400 hover:text-brand-dark hover:bg-brand-wash/50'
                                    }`}
                            >
                                <Upload size={18} /> Upload File
                            </button>
                            <button
                                onClick={() => setActiveTab('youtube')}
                                className={`p-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'youtube'
                                    ? 'bg-brand-wash text-brand-dark border-b-2 border-brand-dark'
                                    : 'text-zinc-400 hover:text-brand-dark hover:bg-brand-wash/50'
                                    }`}
                            >
                                <Youtube size={18} /> YouTube
                            </button>
                        </div>

                        <div className="p-8 min-h-[300px] flex flex-col justify-center bg-white">
                            {activeTab === 'upload' ? (
                                <div className="border-2 border-dashed border-brand-border rounded-2xl p-10 text-center hover:border-brand-accent transition-colors bg-brand-wash/30 group">
                                    <input
                                        type="file"
                                        accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="trim-upload"
                                    />
                                    <label htmlFor="trim-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-brand-accent shadow-lg shadow-brand-dark/5 border border-brand-border group-hover:scale-110 transition-transform duration-300">
                                            <Music size={40} strokeWidth={1.5} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-brand-dark font-bold text-lg">Click to Upload Audio</p>
                                            <p className="text-zinc-500 text-sm font-medium">MP3, WAV, M4A supported</p>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="text-center space-y-4 py-10">
                                    <div className="w-16 h-16 bg-brand-wash rounded-full flex items-center justify-center mx-auto text-zinc-400 border border-brand-border">
                                        <Youtube size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-brand-dark">YouTube Import Coming Soon</h3>
                                        <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2 font-medium">
                                            We are upgrading our YouTube importer to provide a faster and more reliable experience.
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-xs text-brand-accent font-bold bg-brand-wash px-3 py-1.5 rounded-full inline-block border border-brand-border">
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
                            className="flex items-center gap-2 text-zinc-500 hover:text-brand-dark text-sm font-bold transition-colors"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} /> Cut Another Song
                        </button>

                        <AudioTrimmer file={file} />

                        <div className="text-center space-y-2">
                            <p className="text-xs text-zinc-400 font-medium">
                                Processed securely in your browser. No data leaves your device.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
