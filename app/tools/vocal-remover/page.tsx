'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Mic2 } from 'lucide-react';
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
    "AI-Powered Extraction",
    "Center-Channel Analysis",
    "Zero Server Latency",
    "High-Quality WAV Output",
    "Format Flexibility",
    "Privacy Guaranteed"
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
        <div className="min-h-screen bg-slate-50 py-3 px-2">
            <div className="max-w-4xl mx-auto">
                <div className="mb-2">
                    <Link href="/tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-wider mb-4">
                        <ArrowLeft size={14} /> Back to Tools
                    </Link>
                </div>

                {!activeFile ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-violet-200 shadow-lg -rotate-2">
                            <Mic2 size={24} />
                        </div>
                        <h1 className="text-xl font-black text-slate-900 mb-1">Vocal Remover</h1>
                        <p className="text-slate-500 max-w-[240px] mx-auto mb-6 text-[11px] leading-tight">Isolate vocals from any song using our advanced AI Extraction.</p>

                        <label className="cursor-pointer bg-violet-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-violet-700 transition-all active:scale-95 shadow-md shadow-violet-500/10">
                            Upload Song
                            <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r,.ogg" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                        </label>
                    </div>
                ) : (
                    <AudioCutter file={activeFile} initialTab="vocal" onReset={handleReset} onFileChange={setFile} />
                )}
            </div>

            <ToolInfo
                title="AI Vocal Remover & Voice Extractor"
                description="Our Vocal Remover tool uses state-of-the-art AI technology to identify and isolate human voices from musical arrangements. Whether you're an aspiring singer looking for an acapella track or a producer wanting to remix a classic, our browser-side tool provides studio-quality extraction without the need for complex software or cloud processing."
                faqs={vocalFaqs}
                features={vocalFeatures}
            />
        </div>
    );
}
