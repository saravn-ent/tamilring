'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Scissors } from 'lucide-react';
import Link from 'next/link';
import ToolInfo from '@/components/ToolInfo';

const AudioCutter = dynamic(() => import('@/components/AudioCutter'), {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-slate-400 font-bold tracking-widest text-xs">LOADING CUTTER ENGINE...</div>
});

const cutterFaqs = [
    {
        question: "How do I cut an MP3 file online?",
        answer: "Simply upload your MP3 file, use the handles on the waveform to select the part you want to keep, preview the selection, and click export to download your trimmed audio."
    },
    {
        question: "Which audio formats does the cutter support?",
        answer: "We support MP3, WAV, M4A, AAC, M4R (iPhone ringtones), and OGG formats."
    },
    {
        question: "Can I create a ringtone for my iPhone?",
        answer: "Yes, you can trim your audio and save it. Most iPhones use the M4R or MP3 format for ringtones. Our tool helps you get the perfect 30-second clip."
    },
    {
        question: "Is there a file size limit?",
        answer: "There's no strict limit, but we recommend files under 50MB for the smoothest experience as all processing happens locally in your browser."
    }
];

const cutterFeatures = [
    "Visual Waveform Editor",
    "Millisecond Precision",
    "Fade In & Fade Out",
    "One-Click Export",
    "Privacy-First Processing",
    "Mobile Friendly Interface"
];

import { useEditor } from '../editor-context';

export default function CutterPage() {
    const { file: contextFile, setEditorData } = useEditor();
    const [file, setFile] = useState<File | null>(null);

    // Prefer file from context if it exists (passed from ToolsHub)
    const activeFile = file || contextFile;

    const handleReset = () => {
        setFile(null);
        setEditorData(null, 'fx');
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
                    <article className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-indigo-200 shadow-lg rotate-3">
                            <Scissors size={20} />
                        </div>
                        <h1 className="text-xl font-black text-slate-900 mb-1">Free MP3 Cutter</h1>
                        <p className="text-slate-500 max-w-[240px] mx-auto mb-4 text-[11px] leading-tight">
                            Trim, cut, and create perfect ringtones in seconds.
                        </p>

                        {/* SEO-friendly hidden content */}
                        <div className="sr-only">
                            <h2>Professional Audio Trimming Tool</h2>
                            <p>
                                Our free online MP3 cutter allows you to precisely trim and cut audio files
                                to create perfect ringtones. With waveform visualization, real-time preview,
                                and support for multiple audio formats, you can create professional-quality
                                ringtones in seconds. All processing happens in your browser for maximum
                                privacy and security.
                            </p>
                            <h3>Features:</h3>
                            <ul>
                                <li>Precise audio trimming with visual waveform</li>
                                <li>Support for MP3, WAV, M4A, AAC, M4R, OGG formats</li>
                                <li>Real-time audio preview</li>
                                <li>Fade in/fade out effects</li>
                                <li>No file size limits</li>
                                <li>100% free, no registration required</li>
                            </ul>
                        </div>

                        <label className="cursor-pointer bg-[#F92445] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F92445]/90 transition-all active:scale-95 shadow-md shadow-red-500/10">
                            Choose Audio File
                            <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r,.ogg" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                        </label>
                    </article>
                ) : (
                    <AudioCutter file={activeFile} initialTab="fx" onReset={handleReset} onFileChange={setFile} />
                )}
            </div>

            <ToolInfo
                title="Free MP3 Cutter & Ringtone Maker"
                description="TamilRing's MP3 Cutter is a professional-grade web tool that allows you to trim audio files with millisecond precision. Designed for simplicity and speed, it helps you create the perfect ringtone from any song or audio clip. Since it works entirely in your browser using the Web Audio API, your files are never uploaded to our servers, making it the fastest and most private way to edit audio online."
                faqs={cutterFaqs}
                features={cutterFeatures}
            />
        </div>
    );
}
