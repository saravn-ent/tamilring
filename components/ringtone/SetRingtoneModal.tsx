'use client';

import { useState } from 'react';
import { X, Smartphone, Tablet, ChevronRight, HelpCircle } from 'lucide-react';

interface SetRingtoneModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SetRingtoneModal({ isOpen, onClose }: SetRingtoneModalProps) {
    const [activeTab, setActiveTab] = useState<'iphone' | 'android'>('android');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 leading-tight">Setting Your Ringtone</h2>
                        <p className="text-sm text-zinc-500 font-medium">Follow these quick steps</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1.5 bg-zinc-100/50 m-6 rounded-xl border border-zinc-200/50">
                    <button
                        onClick={() => setActiveTab('android')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'android'
                                ? 'bg-white text-zinc-900 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                    >
                        <Smartphone size={16} />
                        Android
                    </button>
                    <button
                        onClick={() => setActiveTab('iphone')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'iphone'
                                ? 'bg-white text-zinc-900 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                    >
                        <Tablet size={16} />
                        iPhone (iOS)
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-8 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'android' ? (
                        <div className="space-y-4">
                            <Step
                                num={1}
                                text="After download, open your phone's Settings app."
                            />
                            <Step
                                num={2}
                                text="Go to Sound & vibration (or Sounds)."
                            />
                            <Step
                                num={3}
                                text="Tap on Ringtone or Phone ringtone."
                            />
                            <Step
                                num={4}
                                text="Tap Add ringtone, Custom or the + icon."
                            />
                            <Step
                                num={5}
                                text="Select the file you just downloaded (usually in the Downloads folder)."
                                isLast
                            />

                            <div className="mt-6 p-4 bg-brand-wash rounded-2xl border border-brand-border/30">
                                <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                                    <span className="font-bold text-brand-accent">Note:</span> On some Samsung phones, you might need to use the "My Files" app to find the downloaded song and select "Set as ringtone" from the menu.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Step
                                num={1}
                                text="Download the ringtone (our site automatically gives you the .m4r file for iPhone)."
                            />
                            <Step
                                num={2}
                                text="Open the free GarageBand app (pre-installed or download from App Store)."
                            />
                            <Step
                                num={3}
                                text="In GarageBand, tap + to create a project, then choose Audio Recorder."
                            />
                            <Step
                                num={4}
                                text="Tap the Tracks icon (brick wall icon top left), then the Loops icon (circle top right)."
                            />
                            <Step
                                num={5}
                                text="Choose Files tab -> Browse items from Files -> Select your download."
                            />
                            <Step
                                num={6}
                                text="Drag the file onto the timeline. Tap the down arrow (top left) -> My Songs to save."
                            />
                            <Step
                                num={7}
                                text="Long-press your project -> Share -> Ringtone -> Export."
                                isLast
                            />

                            <div className="mt-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                                <p className="text-xs text-zinc-600 font-medium leading-relaxed flex items-start gap-2">
                                    <HelpCircle size={14} className="mt-0.5 text-zinc-400 flex-shrink-0" />
                                    iPhone security restricts direct ringtone settings. Using GarageBand is the standard way to set any custom tone without a computer.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-zinc-900 font-bold text-sm px-8 py-2.5 hover:bg-zinc-200/50 rounded-xl transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}

function Step({ num, text, isLast }: { num: number; text: string; isLast?: boolean }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-black shadow-lg shadow-brand-accent/20">
                    {num}
                </div>
                {!isLast && <div className="w-0.5 h-full bg-zinc-100 my-1" />}
            </div>
            <div className="pt-1 pb-4 flex-1">
                <p className="text-zinc-800 text-[15px] font-semibold leading-relaxed">
                    {text}
                </p>
            </div>
        </div>
    );
}
