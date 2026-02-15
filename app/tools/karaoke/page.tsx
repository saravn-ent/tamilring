'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Music2, Upload, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import ToolInfo from '@/components/ToolInfo';
import { useEditor } from '../editor-context';

const AudioCutter = dynamic(() => import('@/components/AudioCutter'), {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-slate-400 font-bold tracking-widest text-xs">LOADING KARAOKE ENGINE...</div>
});

const karaokeFaqs = [
    {
        question: "How does the Karaoke Maker work?",
        answer: "Our tool uses advanced phase cancellation and EQ filtering to isolate and reduce vocal frequencies while preserving the backing track and instrumentals."
    },
    {
        question: "Will the quality remain high?",
        answer: "We use high-fidelity processing to ensure the backing track stays clear. For best results, use high-quality source files (320kbps MP3 or WAV)."
    },
    {
        question: "Is it really free?",
        answer: "Yes! You can create as many karaoke tracks as you want for free. All processing happens in your browser for total privacy."
    }
];

const karaokeFeatures = [
    "Phase Cancellation",
    "Smart Bass Preservation",
    "High Fidelity Output",
    "Real-time Filtering",
    "Browser-Based Privacy",
    "Zero Server Delay"
];

export default function KaraokePage() {
    const { file: contextFile, setEditorData } = useEditor();
    const [file, setFile] = useState<File | null>(null);

    // Prefer file from context if it exists (passed from ToolsHub)
    const activeFile = file || contextFile;

    const handleReset = () => {
        setFile(null);
        setEditorData(null, 'karaoke');
    };

    return (
        <div className="min-h-screen bg-slate-50 py-3 px-2">
            <div className="max-w-4xl mx-auto">
                <div className="mb-2">
                    <Link href="/tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-wider mb-4">
                        <ArrowLeft size={16} /> Back to Tools
                    </Link>
                </div>

                {!activeFile ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-4xl border border-slate-100 shadow-sm p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-100/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-100/30 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                            <div className="w-16 h-16 bg-teal-600 text-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-teal-500/40 rotate-1 hover:rotate-6 transition-transform duration-500 relative">
                                <Music2 size={32} />
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-1 bg-slate-900 text-white text-[8px] font-black rounded-md tracking-widest uppercase">Studio Quality</span>
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Karaoke <span className="text-teal-600 tracking-tighter">MAKER</span></h1>
                            <p className="text-slate-500 max-w-[280px] mx-auto mb-10 text-[10px] font-bold leading-relaxed">
                                Professional instrumental creation with smart phase isolation.
                            </p>

                            <label className="group relative cursor-pointer w-full">
                                <div className="absolute -inset-1 bg-linear-to-r from-teal-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <div className="relative h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl">
                                    <Upload className="w-4 h-4" />
                                    Upload Song
                                    <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r,.ogg" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                                </div>
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm animate-in slide-in-from-bottom duration-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 size={18} />
                                </div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Master Verified</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="flex flex-col py-2 border-b border-slate-50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Name</span>
                                    <span className="text-[10px] font-black text-slate-700 truncate">{activeFile.name}</span>
                                </div>
                                <div className="flex flex-col py-2 border-b border-slate-50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Format</span>
                                    <span className="text-[10px] font-black text-slate-700 uppercase">{activeFile.type.split('/')[1] || 'Audio'}</span>
                                </div>
                                <div className="flex flex-col py-2 border-b border-slate-50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Size</span>
                                    <span className="text-[10px] font-black text-slate-700">{(activeFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                            </div>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                            <AudioCutter file={activeFile} initialTab="karaoke" onReset={handleReset} onFileChange={setFile} />
                        </div>
                    </div>
                )}
            </div>

            <ToolInfo
                title="Karaoke Maker & Instrumental Creator"
                description="TamilRing's Karaoke Maker uses advanced signal processing to isolate musical tracks from vocals. Unlike other tools that upload your data, our tool processes everything locally on your device, ensuring maximum privacy and instant results. Perfect for creating backing tracks for your own covers or just enjoying the music without distraction."
                faqs={karaokeFaqs}
                features={karaokeFeatures}
            />
        </div>
    );
}
