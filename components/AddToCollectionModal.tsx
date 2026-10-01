'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Ringtone } from '@/types';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';
import { useToast } from '@/context/ToastContext';

interface CollectionItem {
    id: string;
    label: string;
    emoji: string;
    ringtone?: Ringtone | null;
}

const DEFAULT_COLLECTIONS: CollectionItem[] = [
    { id: 'mom', label: 'Mom', emoji: '❤️' },
    { id: 'dad', label: 'Dad', emoji: '👨‍👧' },
    { id: 'love', label: 'Love', emoji: '💑' },
    { id: 'bestie', label: 'Bestie', emoji: '👯' },
];

interface AddToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    ringtone: Ringtone;
}

export default function AddToCollectionModal({ isOpen, onClose, ringtone }: AddToCollectionModalProps) {
    const { showToast } = useToast();
    const [collections, setCollections] = useState<CollectionItem[]>(() => {
        if (typeof window === 'undefined') return DEFAULT_COLLECTIONS;
        const saved = localStorage.getItem('user_collections');
        return saved ? JSON.parse(saved) : DEFAULT_COLLECTIONS;
    });
    const [assignedTo, setAssignedTo] = useState<string | null>(null);

    const handleAssign = (collectionId: string) => {
        hapticFeedback(hapticPatterns.impact);
        const target = collections.find(c => c.id === collectionId);
        const updated = collections.map(c => {
            if (c.id === collectionId) return { ...c, ringtone };
            return c;
        });

        localStorage.setItem('user_collections', JSON.stringify(updated));
        setCollections(updated);
        setAssignedTo(collectionId);
        showToast(`Assigned to ${target?.label || 'collection'}! 🎉`, 'success');

        // Close after a brief delay to show success state
        setTimeout(() => {
            onClose();
            setAssignedTo(null);
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-m3-surface-container-high text-m3-on-surface border border-m3-outline-variant/40 w-full max-w-xs rounded-3xl p-5 m3-elevation-3 scale-100 animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-m3-on-surface">For My</h3>
                    <button 
                        onClick={onClose} 
                        className="text-m3-on-surface-variant hover:text-m3-on-surface p-1 rounded-full hover:bg-m3-surface-container transition-colors cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                    {collections.map((item) => {
                        const isAssigned = item.ringtone?.id === ringtone.id;
                        const justAssigned = assignedTo === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleAssign(item.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                    isAssigned || justAssigned
                                        ? 'bg-m3-secondary-container text-m3-on-secondary-container border-m3-primary/30 shadow-2xs font-bold'
                                        : 'bg-m3-surface-container-low border-m3-outline-variant/40 text-m3-on-surface hover:bg-m3-surface-container'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{item.emoji}</span>
                                    <span className="font-semibold text-sm">{item.label}</span>
                                </div>
                                {justAssigned && <Check size={18} className="animate-in zoom-in text-m3-primary" />}
                                {isAssigned && !justAssigned && <span className="text-xs bg-m3-primary/10 text-m3-primary px-2.5 py-0.5 rounded-full font-bold">Current</span>}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-m3-outline">Manage people in your Profile</p>
                </div>
            </div>
        </div>
    );
}

