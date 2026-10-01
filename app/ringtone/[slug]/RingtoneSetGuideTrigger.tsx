'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import SetRingtoneModal from '@/components/ringtone/SetRingtoneModal';
import { M3Chip } from '@/components/ui/m3';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface RingtoneSetGuideTriggerProps {
    variant?: 'default' | 'header';
    className?: string;
}

export default function RingtoneSetGuideTrigger({ variant = 'default', className = '' }: RingtoneSetGuideTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        hapticFeedback(hapticPatterns.selection);
        setIsOpen(true);
    };

    if (variant === 'header') {
        return (
            <>
                <button
                    type="button"
                    onClick={handleOpen}
                    className={cn(
                        "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-m3-surface-container/90 hover:bg-m3-surface-container text-m3-on-surface border border-m3-outline-variant/60 backdrop-blur-md shadow-xs transition-all active:scale-95 cursor-pointer text-xs font-semibold",
                        className
                    )}
                >
                    <HelpCircle size={14} className="text-m3-primary shrink-0" />
                    <span className="text-m3-on-surface">How to Set</span>
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
                onClick={handleOpen}
                className={`flex items-center justify-center gap-2 text-xs font-semibold text-m3-on-surface hover:text-m3-primary transition-colors py-2 px-4 rounded-full bg-m3-surface-container-low border border-m3-outline-variant/60 hover:bg-m3-surface-container cursor-pointer active:scale-95 ${className}`}
            >
                <HelpCircle size={15} className="text-m3-primary shrink-0" />
                <span className="text-m3-on-surface font-semibold">How to set as ringtone?</span>
            </button>

            <SetRingtoneModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}

