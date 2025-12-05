'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Ringtone } from '@/types';

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
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const [assignedTo, setAssignedTo] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('user_collections');
            if (saved) {
                setCollections(JSON.parse(saved));
            } else {
                setCollections(DEFAULT_COLLECTIONS);
                localStorage.setItem('user_collections', JSON.stringify(DEFAULT_COLLECTIONS));
            }
        }
    }, [isOpen]);

    const handleAssign = (collectionId: string) => {
        const updated = collections.map(c => {
            if (c.id === collectionId) return { ...c, ringtone };
            return c;
        });

        localStorage.setItem('user_collections', JSON.stringify(updated));
        setCollections(updated);
        setAssignedTo(collectionId);

        // Close after a brief delay to show success state
        setTimeout(() => {
            onClose();
            setAssignedTo(null);
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-neutral-900 border border-neutral-800 w-full max-w-xs rounded-2xl p-4 shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Set Ringtone For...</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700">
                    {collections.map((item) => {
                        const isAssigned = item.ringtone?.id === ringtone.id;
                        const justAssigned = assignedTo === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleAssign(item.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${isAssigned || justAssigned
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                                        : 'bg-neutral-800 border-neutral-700 text-zinc-300 hover:bg-neutral-700 hover:border-neutral-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{item.emoji}</span>
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                {justAssigned && <Check size={18} className="animate-in zoom-in" />}
                                {isAssigned && !justAssigned && <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">Current</span>}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-zinc-500">Manage people in your Profile</p>
                </div>
            </div>
        </div>
    );
}
