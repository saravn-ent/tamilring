'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Music2 } from 'lucide-react';
import Link from 'next/link';

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
    "Vocal Phase Isolation",
    "Bass Preservation",
    "High Fidelity Output",
    "Real-time Processing",
    "Browser-Based Privacy",
    "Multiple Format Support"
];

import ToolInfo from '@/components/ToolInfo';
import { useEditor } from '../editor-context';

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
                    <Link href="/tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-wider mb-4">
                        <ArrowLeft size={14} /> Back to Tools
                    </Link>
                </div>

                {!activeFile ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-teal-200 shadow-lg rotate-1">
                            <Music2 size={24} />
                        </div>
                        <h1 className="text-xl font-black text-slate-900 mb-1">Karaoke Maker</h1>
                        <p className="text-slate-500 max-w-[240px] mx-auto mb-6 text-[11px] leading-tight">Remove vocals and keep the instrumentals with AI detection.</p>

                        <label className="cursor-pointer bg-teal-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all active:scale-95 shadow-md shadow-teal-500/10">
                            Upload Song
                            <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r,.ogg" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                        </label>
                    </div>
                ) : (
                    <AudioCutter file={activeFile} initialTab="karaoke" onReset={handleReset} onFileChange={setFile} />
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
