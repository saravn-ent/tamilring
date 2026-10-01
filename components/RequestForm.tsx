'use client';

import { useState } from 'react';
import { createRingtoneRequest } from '@/app/actions/requests';
import { Music, Film, FileText, Send, CircleCheckBig, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';

export default function RequestForm({ onComplete }: { onComplete: () => void }) {
    const { language } = useLanguage();
    const { showToast } = useToast();
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
            showToast('Ringtone request submitted! 🚀', 'success');
            setFormData({ movie_name: '', song_name: '', description: '' });
            setTimeout(() => {
                setSuccess(false);
                onComplete();
            }, 2000);
        } else {
            const errorMsg = res.error || 'Something went wrong';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                    <CircleCheckBig size={40} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-m3-on-surface">Request Submitted!</h3>
                    <p className="text-m3-on-surface-variant text-sm">Our community will notify you once it's available.</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Movie Name */}
                <div>
                    <label className="block text-xs font-bold text-m3-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
                        Movie Name
                    </label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-m3-outline">
                            <Film size={18} />
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Leo, Vikram, Ponniyin Selvan"
                            value={formData.movie_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, movie_name: e.target.value }))}
                            className="w-full bg-m3-surface border border-m3-outline-variant/30 rounded-xl py-3 pl-11 pr-4 text-m3-on-surface focus:border-m3-primary focus:ring-1 focus:ring-m3-primary outline-none transition-all placeholder:text-m3-outline"
                        />
                    </div>
                </div>

                {/* Song Name */}
                <div>
                    <label className="block text-xs font-bold text-m3-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
                        Song / BGM Name
                    </label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-m3-outline">
                            <Music size={18} />
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Ordinary Person, Flute BGM"
                            value={formData.song_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, song_name: e.target.value }))}
                            className="w-full bg-m3-surface border border-m3-outline-variant/30 rounded-xl py-3 pl-11 pr-4 text-m3-on-surface focus:border-m3-primary focus:ring-1 focus:ring-m3-primary outline-none transition-all placeholder:text-m3-outline"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold text-m3-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
                        Specific Details (Optional)
                    </label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-4 text-m3-outline">
                            <FileText size={18} />
                        </div>
                        <textarea
                            placeholder="e.g. Needs the whistle part from the climax..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-m3-surface border border-m3-outline-variant/30 rounded-xl py-3 pl-11 pr-4 text-m3-on-surface focus:border-m3-primary focus:ring-1 focus:ring-m3-primary outline-none transition-all min-h-[100px] resize-none placeholder:text-m3-outline"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-m3-error-container text-m3-on-error-container border border-m3-error/20 text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-m3-primary hover:bg-m3-primary/90 disabled:opacity-50 text-m3-on-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-m3-primary/20"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                Submit Request
            </button>
        </form>
    );
}
