'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Mic2, Upload, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const AudioCutter = dynamic(() => import('@/components/AudioCutter'), {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-slate-400 font-bold tracking-widest text-xs">LOADING AI ENGINE...</div>
});

const vocalFaqs = [
    {
        question: "How do I remove vocals from a song?",
        answer: "Just upload your audio file and our AI engine will automatically identify and isolate the vocal tracks. You can then download the extracted vocals as a separate file."
    },
    {
        question: "Is my data sent to a server?",
        answer: "No, all vocal removal happens directly in your browser using the Web Audio API. Your files never leave your device."
    },
    {
        question: "Does it work with any song?",
        answer: "It works best with studio recordings where vocals are panned to the center. It may have varying results with live recordings or mono tracks."
    }
];

const vocalFeatures = [
    "Vocal Range Isolation",
    "Center-Channel Analysis",
    "Zero Server Latency",
    "High-Quality WAV Output",
    "Advanced Frequency Filtering",
    "100% Browser-Side Privacy"
];

import ToolInfo from '@/components/ToolInfo';
import { useEditor } from '../editor-context';

export default function VocalRemoverPage() {
    const { file: contextFile, setEditorData } = useEditor();
    const [file, setFile] = useState<File | null>(null);

    // Prefer file from context if it exists (passed from ToolsHub)
    const activeFile = file || contextFile;

    const handleReset = () => {
        setFile(null);
        setEditorData(null, 'vocal');
    };

    return (
        <div className="min-h-screen py-3 px-2">
            <div className="max-w-4xl mx-auto">
                <div className="mb-2">
                    <Link href="/tools" className="inline-flex items-center gap-2 text-m3-outline hover:text-m3-on-surface font-bold text-xs uppercase tracking-wider mb-4">
                        <ArrowLeft size={16} /> Back to Tools
                    </Link>
                </div>

                {!activeFile ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-m3-surface-container rounded-4xl border border-m3-outline-variant/30 shadow-sm p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                            <div className="w-16 h-16 bg-violet-600 text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-violet-500/30 -rotate-3 hover:rotate-0 transition-transform duration-500 relative">
                                <Mic2 size={32} />
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2.5 py-1 bg-m3-surface-container-highest text-m3-on-surface text-[8px] font-black rounded-md tracking-widest uppercase border border-m3-outline-variant/30">Studio Quality</span>
                            </div>

                            <h1 className="text-3xl font-display font-black text-m3-on-surface mb-2 tracking-tight">Vocal <span className="text-violet-500 tracking-tighter">EXTRACTOR</span></h1>
                            <p className="text-m3-on-surface-variant max-w-[280px] mx-auto mb-10 text-[10px] font-bold leading-relaxed">
                                Professional voice isolation using high-precision phase cancellation.
                            </p>

                            <label className="group relative cursor-pointer w-full">
                                <div className="absolute -inset-1 bg-linear-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <div className="relative h-14 bg-m3-primary text-m3-on-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md">
                                    <Upload className="w-4 h-4" />
                                    Upload Song
                                    <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r,.ogg" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                                </div>
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-m3-surface-container rounded-[2.5rem] p-6 border border-m3-outline-variant/30 shadow-sm animate-in slide-in-from-bottom duration-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                    <CheckCircle2 size={18} />
                                </div>
                                <h3 className="text-xs font-black text-m3-on-surface uppercase tracking-widest">File Verified</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="flex flex-col py-2 border-b border-m3-outline-variant/20">
                                    <span className="text-[10px] font-bold text-m3-outline uppercase tracking-tight">Name</span>
                                    <span className="text-[10px] font-black text-m3-on-surface truncate">{activeFile.name}</span>
                                </div>
                                <div className="flex flex-col py-2 border-b border-m3-outline-variant/20">
                                    <span className="text-[10px] font-bold text-m3-outline uppercase tracking-tight">Format</span>
                                    <span className="text-[10px] font-black text-m3-on-surface uppercase">{activeFile.type.split('/')[1] || 'Audio'}</span>
                                </div>
                                <div className="flex flex-col py-2 border-b border-m3-outline-variant/20">
                                    <span className="text-[10px] font-bold text-m3-outline uppercase tracking-tight">Size</span>
                                    <span className="text-[10px] font-black text-m3-on-surface">{(activeFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                            </div>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                            <AudioCutter file={activeFile} initialTab="vocal" onReset={handleReset} onFileChange={setFile} />
                        </div>
                    </div>
                )}
            </div>

            <ToolInfo
                title="AI Engineering: Professional Vocal Extractor"
                description="Our Vocal Extractor represents the pinnacle of browser-side audio engineering. By combining the MDX-Net neural engine (ranked #1 in global demixing challenges) with Gemini's structural intelligence, we deliver studio-quality extraction that rivals professional paid services. All processing happens locally on your device using WebGPU acceleration, ensuring 100% privacy and zero latency."
                faqs={vocalFaqs}
                features={[
                    ...vocalFeatures,
                    "MDX-Net Neural Separation",
                    "Gemini Structural Analysis",
                    "WebGPU Hardware Acceleration",
                    "Phase-Correct Signal Reconstruction"
                ]}
            />
        </div>
    );
}
