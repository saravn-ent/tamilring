'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Scissors } from 'lucide-react';

const AudioCutter = dynamic(() => import('@/components/AudioCutter'), {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-slate-400 font-bold tracking-widest text-xs">LOADING CUTTER ENGINE...</div>
});

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
                    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-indigo-200 shadow-xl rotate-3">
                            <Scissors size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">MP3 Cutter</h1>
                        <p className="text-slate-500 max-w-xs mx-auto mb-8">Upload any audio file to trim, cut, and create perfect ringtones manually.</p>

                        <label className="cursor-pointer bg-[#F92445] text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#F92445]/90 transition-all active:scale-95 shadow-lg shadow-red-500/20">
                            Choose Audio File
                            <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r,.ogg" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                        </label>
                    </div>
                ) : (
                    <AudioCutter file={activeFile} initialTab="fx" onReset={handleReset} onFileChange={setFile} />
                )}
            </div>
        </div>
    );
}
