'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, User, X, Search } from 'lucide-react';
import { Ringtone } from '@/types';
import ImageWithFallback from './ImageWithFallback';
import { getImageUrl } from '@/lib/tmdb';

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

export default function PersonalCollections() {
    const [collections, setCollections] = useState<CollectionItem[]>(() => {
        if (typeof window === 'undefined') return DEFAULT_COLLECTIONS;
        const saved = localStorage.getItem('user_collections');
        return saved ? JSON.parse(saved) : DEFAULT_COLLECTIONS;
    });
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newEmoji, setNewEmoji] = useState('👤');

    const saveCollections = (newCollections: CollectionItem[]) => {
        setCollections(newCollections);
        localStorage.setItem('user_collections', JSON.stringify(newCollections));
    };

    const handleAdd = () => {
        if (!newLabel.trim()) return;
        const newItem: CollectionItem = {
            id: Date.now().toString(),
            label: newLabel,
            emoji: newEmoji,
        };
        saveCollections([...collections, newItem]);
        setNewLabel('');
        setIsAdding(false);
    };

    const removeCollection = (id: string) => {
        if (confirm('Remove this person?')) {
            saveCollections(collections.filter(c => c.id !== id));
        }
    };

    const removeRingtone = (id: string) => {
        const updated = collections.map(c => {
            if (c.id === id) return { ...c, ringtone: undefined };
            return c;
        });
        saveCollections(updated);
    };

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-m3-on-surface flex items-center gap-2">
                    <User size={18} className="text-m3-primary" />
                    For My
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs text-m3-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                    <Plus size={14} /> Add Person
                </button>
            </div>

            {isAdding && (
                <div className="mb-4 p-3 bg-m3-surface-container-high rounded-2xl border border-m3-outline-variant/40 flex gap-2 items-center animate-in fade-in slide-in-from-top-2 shadow-xs">
                    <select
                        value={newEmoji}
                        onChange={(e) => setNewEmoji(e.target.value)}
                        className="bg-m3-surface-container border border-m3-outline-variant/40 rounded-xl px-2 py-2 text-lg text-m3-on-surface focus:outline-none focus:border-m3-primary"
                    >
                        {['👤', '❤️', '👨‍👩‍👧', '👶', '👵', '👴', '🐶', '🐱', '💼', '🔥', '⭐'].map(e => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Name (e.g. Uncle, Gym)"
                        className="flex-1 bg-m3-surface-container border border-m3-outline-variant/40 rounded-xl px-3 py-2 text-sm text-m3-on-surface placeholder:text-m3-outline focus:outline-none focus:border-m3-primary"
                        autoFocus
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-m3-primary text-m3-on-primary px-4 py-2 rounded-full text-xs font-bold hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                        Add
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {collections.map((item) => (
                    <div key={item.id} className="bg-m3-surface-container-low border border-m3-outline-variant/40 rounded-2xl p-3 relative group hover:shadow-2xs transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{item.emoji}</span>
                                <span className="font-semibold text-m3-on-surface text-xs sm:text-sm truncate max-w-[80px]">{item.label}</span>
                            </div>
                            {!DEFAULT_COLLECTIONS.find(d => d.id === item.id) && (
                                <button
                                    onClick={() => removeCollection(item.id)}
                                    className="text-m3-on-surface-variant hover:text-m3-error transition-colors p-1"
                                    aria-label="Remove person"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {item.ringtone ? (
                            <div className="relative bg-m3-surface-container rounded-xl p-2 flex gap-2 items-center group/card border border-m3-outline-variant/30">
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-m3-surface-container-high">
                                    {item.ringtone.poster_url && (
                                        <ImageWithFallback src={getImageUrl(item.ringtone.poster_url)} alt={item.ringtone.title} fill className="object-cover" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-m3-on-surface truncate">{item.ringtone.title}</p>
                                    <p className="text-[10px] text-m3-outline truncate">{item.ringtone.movie_name}</p>
                                </div>
                                <button
                                    onClick={() => removeRingtone(item.id)}
                                    className="absolute -top-1 -right-1 bg-m3-error text-m3-on-error rounded-full p-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity shadow-xs"
                                    aria-label="Remove ringtone from person"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/search?assignTo=${item.id}&q=${item.label}`}
                                className="w-full py-2 rounded-xl border border-dashed border-m3-outline-variant/60 text-m3-on-surface-variant text-xs text-center hover:bg-m3-surface-container hover:text-m3-primary hover:border-m3-primary transition-all flex items-center justify-center gap-1 font-medium"
                            >
                                <Search size={12} /> Assign Ringtone
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

