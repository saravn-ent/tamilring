'use client';

import { useState } from 'react';
import { Search, Loader2, Youtube, AlertCircle, ClipboardPaste, ArrowRight, Link as LinkIcon } from 'lucide-react';

interface YouTubeImporterProps {
    onLoad: (file: File) => void;
}

export default function YouTubeImporter({ onLoad }: YouTubeImporterProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!url.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/youtube?url=${encodeURIComponent(url)}`);

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to fetch audio');
            }

            const blob = await res.blob();
            // Create a File object from the blob
            const file = new File([blob], "youtube_audio.mp3", { type: 'audio/mpeg' });
            onLoad(file);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setUrl(text);
                // Optional: Auto-submit or just focus?
                // document.getElementById('youtube-input')?.focus();
            }
        } catch (err) {
            console.error('Clipboard access denied', err);
            // Fallback: Focus input so user can paste manually
            const input = document.querySelector('input[name="youtube-url"]') as HTMLInputElement;
            input?.focus();
        }
    };

    return (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Youtube size={16} className="text-red-500" />
                Import from YouTube
            </h3>

            <form onSubmit={handleImport} className="space-y-4">
                <div>
                    <label className="sr-only">YouTube URL</label>
                    <div className="relative group">
                        {/* Left Icon: Link Context */}
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors pointer-events-none">
                            <LinkIcon size={18} />
                        </div>

                        <input
                            name="youtube-url"
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste YouTube Video Link..."
                            className="w-full bg-black/50 border border-neutral-700 rounded-lg pl-10 pr-12 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                        />

                        {/* Right Button: Smart Action */}
                        <button
                            type={url ? "submit" : "button"}
                            disabled={loading}
                            onClick={url ? undefined : handlePaste}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all 
                                ${loading || url
                                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                                    : 'bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                }
                            `}
                            title={url ? "Import Audio" : "Paste from Clipboard"}
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : url ? (
                                <ArrowRight size={20} />
                            ) : (
                                <ClipboardPaste size={20} />
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-in slide-in-from-top-2">
                        <AlertCircle size={14} />
                        <p>{error}</p>
                    </div>
                )}

                <div className="text-[10px] text-zinc-500 text-center space-y-1">
                    <p>Note: For ringtone use only. Please respect copyright laws.</p>
                    <p>If import fails, try downloading the MP3 manually and use the "Upload File" tab.</p>
                </div>
            </form>
        </div>
    );
}
