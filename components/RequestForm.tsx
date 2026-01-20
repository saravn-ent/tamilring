'use client';

import { useState } from 'react';
import { createRingtoneRequest } from '@/app/actions/requests';
import { Music, Film, FileText, Send, CheckCircle2, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function RequestForm({ onComplete }: { onComplete: () => void }) {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        movie_name: '',
        song_name: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await createRingtoneRequest(formData);

        if (res.success) {
            setSuccess(true);
            setFormData({ movie_name: '', song_name: '', description: '' });
            setTimeout(() => {
                setSuccess(false);
                onComplete();
            }, 2000);
        } else {
            setError(res.error || 'Something went wrong');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={40} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Request Submitted!</h3>
                    <p className="text-zinc-400 text-sm">Our community will notify you once it's available.</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Movie Name */}
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                        Movie Name
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                            <Film size={18} />
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Leo, Vikram, Ponniyin Selvan"
                            value={formData.movie_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, movie_name: e.target.value }))}
                            className="w-full bg-white border border-brand-gray rounded-xl py-3 pl-11 pr-4 text-brand-dark focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all placeholder:text-zinc-300"
                        />
                    </div>
                </div>

                {/* Song Name */}
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                        Song / BGM Name
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                            <Music size={18} />
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Ordinary Person, Flute BGM"
                            value={formData.song_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, song_name: e.target.value }))}
                            className="w-full bg-white border border-brand-gray rounded-xl py-3 pl-11 pr-4 text-brand-dark focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all placeholder:text-zinc-300"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                        Specific Details (Optional)
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-4 text-zinc-400">
                            <FileText size={18} />
                        </div>
                        <textarea
                            placeholder="e.g. Needs the whistle part from the climax..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-white border border-brand-gray rounded-xl py-3 pl-11 pr-4 text-brand-dark focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all min-h-[100px] resize-none placeholder:text-zinc-300"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-accent hover:bg-brand-accent/90 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand-accent/20"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                Submit Request
            </button>
        </form>
    );
}
