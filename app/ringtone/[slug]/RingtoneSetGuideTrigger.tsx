'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import SetRingtoneModal from '@/components/ringtone/SetRingtoneModal';

interface RingtoneSetGuideTriggerProps {
    variant?: 'default' | 'header';
}

export default function RingtoneSetGuideTrigger({ variant = 'default' }: RingtoneSetGuideTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (variant === 'header') {
        return (
            <>
                <button
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-accent bg-white border border-brand-gray px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <HelpCircle size={24} strokeWidth={2.5} />
                    <span className="text-base font-semibold">How to Set</span>
                </button>

                <SetRingtoneModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-zinc-400 hover:text-brand-accent transition-colors py-2 px-4 rounded-full bg-zinc-50 border border-zinc-100/50 hover:bg-white hover:shadow-sm"
            >
                <HelpCircle size={14} />
                <span>GUIDE: HOW TO SET AS RINGTONE?</span>
            </button>

            <SetRingtoneModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
