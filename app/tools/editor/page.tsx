'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor } from '../editor-context';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const AudioCutter = dynamic(() => import('@/components/AudioCutter'), {
    ssr: false,
    loading: () => (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading Studio Engine...</p>
        </div>
    )
});

export default function EditorPage() {
    const { file, mode, setEditorData } = useEditor();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!file) {
            router.replace('/tools');
        }
    }, [file, router]);

    if (!mounted || !file) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-3 px-2">
            <div className="max-w-4xl mx-auto">
                <div className="mb-2">
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-wider mb-4">
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <AudioCutter
                        file={file}
                        initialTab={mode}
                        onReset={() => {
                            setEditorData(null, 'fx');
                            router.back();
                        }}
                        onFileChange={(newFile) => setEditorData(newFile, mode)}
                    />
                </div>
            </div>
        </div>
    );
}
