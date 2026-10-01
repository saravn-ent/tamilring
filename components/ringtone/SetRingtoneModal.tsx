'use client';

import { useState } from 'react';
import { X, Smartphone, Tablet, HelpCircle } from 'lucide-react';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

interface SetRingtoneModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SetRingtoneModal({ isOpen, onClose }: SetRingtoneModalProps) {
    const [activeTab, setActiveTab] = useState<'iphone' | 'android'>('android');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-lg bg-m3-surface-container-high text-m3-on-surface rounded-3xl overflow-hidden m3-elevation-3 border border-m3-outline-variant/40 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-m3-outline-variant/30 flex items-center justify-between bg-m3-surface-container-high">
                    <div>
                        <h2 className="text-xl font-bold text-m3-on-surface leading-tight">Setting Your Ringtone</h2>
                        <p className="text-sm text-m3-outline font-medium">Follow these quick steps</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-m3-surface-container rounded-full transition-colors text-m3-on-surface-variant cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Tab Switcher (M3 Segmented Button) */}
                <div className="flex p-1 bg-m3-surface-container m-6 rounded-full border border-m3-outline-variant/40">
                    <button
                        onClick={() => {
                            hapticFeedback(hapticPatterns.selection);
                            setActiveTab('android');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'android'
                                ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-2xs'
                                : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                        }`}
                    >
                        <Smartphone size={15} />
                        <span>Android</span>
                    </button>
                    <button
                        onClick={() => {
                            hapticFeedback(hapticPatterns.selection);
                            setActiveTab('iphone');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'iphone'
                                ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-2xs'
                                : 'text-m3-on-surface-variant hover:text-m3-on-surface'
                        }`}
                    >
                        <Tablet size={15} />
                        <span>iPhone (iOS)</span>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 overflow-y-auto max-h-[60vh] scrollbar-thin">
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

                            <div className="mt-6 p-4 bg-m3-surface-container rounded-2xl border border-m3-outline-variant/30">
                                <p className="text-xs text-m3-on-surface-variant font-medium leading-relaxed">
                                    <span className="font-bold text-m3-primary">Note:</span> On some Samsung phones, you might need to use the &quot;My Files&quot; app to find the downloaded song and select &quot;Set as ringtone&quot; from the menu.
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

                            <div className="mt-6 p-4 bg-m3-surface-container rounded-2xl border border-m3-outline-variant/30">
                                <p className="text-xs text-m3-on-surface-variant font-medium leading-relaxed flex items-start gap-2">
                                    <HelpCircle size={14} className="mt-0.5 text-m3-primary shrink-0" />
                                    iPhone security restricts direct ringtone settings. Using GarageBand is the standard way to set any custom tone without a computer.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer (M3 Filled Button) */}
                <div className="p-4 bg-m3-surface-container-high border-t border-m3-outline-variant/30 flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-m3-primary text-m3-on-primary font-bold text-sm px-8 py-2.5 rounded-full hover:shadow-xs active:scale-95 transition-all cursor-pointer"
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
            <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-m3-primary text-m3-on-primary flex items-center justify-center text-xs font-bold shadow-2xs">
                    {num}
                </div>
                {!isLast && <div className="w-0.5 h-full bg-m3-outline-variant/40 my-1" />}
            </div>
            <div className="pt-1 pb-4 flex-1">
                <p className="text-m3-on-surface text-sm font-semibold leading-relaxed">
                    {text}
                </p>
            </div>
        </div>
    );
}

