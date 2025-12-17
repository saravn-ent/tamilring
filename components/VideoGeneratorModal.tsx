'use client';

import { X, Video, Sparkles } from 'lucide-react';
import { Ringtone } from '@/types';
import SpotifyCard from './SpotifyCard';

interface VideoGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    ringtone: Ringtone;
}

export default function VideoGeneratorModal({ isOpen, onClose, ringtone }: VideoGeneratorModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-neutral-900 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">

                {/* Preview Section */}
                <div className="flex-1 bg-black/50 p-8 flex items-center justify-center relative overflow-hidden">
                    <SpotifyCard ringtone={ringtone} className="scale-90 md:scale-100 shadow-2xl" />
                </div>

                {/* Coming Soon Section */}
                <div className="w-full md:w-96 p-8 flex flex-col justify-between bg-neutral-900">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-white">Share Video</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Coming Soon Badge */}
                            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 p-6 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <Sparkles className="text-emerald-500" size={24} />
                                    <h3 className="text-lg font-bold text-white">Coming Soon!</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    We're building an amazing video generator that will create stunning social media stories for Instagram, WhatsApp, and TikTok.
                                </p>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">What's Coming:</p>
                                <ul className="space-y-2 text-sm text-zinc-400">
                                    <li className="flex items-start gap-2">
                                        <Video size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <span>HD video export (9:16 vertical format)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Video size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Custom branding and effects</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Video size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <span>One-tap sharing to social media</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition-all"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
