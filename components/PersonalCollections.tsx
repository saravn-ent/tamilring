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
                <h2 className="text-lg font-bold text-[#15171A] flex items-center gap-2">
                    <User size={20} className="text-[#3EB0EF]" />
                    For My
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs text-[#3EB0EF] font-medium hover:underline flex items-center gap-1"
                >
                    <Plus size={14} /> Add Person
                </button>
            </div>

            {isAdding && (
                <div className="mb-4 p-3 bg-white rounded-xl border border-[#E5EBF1] flex gap-2 items-center animate-in fade-in slide-in-from-top-2 shadow-sm">
                    <select
                        value={newEmoji}
                        onChange={(e) => setNewEmoji(e.target.value)}
                        className="bg-zinc-50 border border-[#E5EBF1] rounded-lg px-2 py-2 text-lg focus:outline-none focus:border-[#3EB0EF]"
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
                        className="flex-1 bg-zinc-50 border border-[#E5EBF1] rounded-lg px-3 py-2 text-sm text-[#15171A] focus:outline-none focus:border-[#3EB0EF]"
                        autoFocus
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-[#3EB0EF] text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-600"
                    >
                        Add
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {collections.map((item) => (
                    <div key={item.id} className="bg-white border border-[#E5EBF1] rounded-xl p-3 relative group hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{item.emoji}</span>
                                <span className="font-medium text-zinc-700 text-sm truncate max-w-[80px]">{item.label}</span>
                            </div>
                            {!DEFAULT_COLLECTIONS.find(d => d.id === item.id) && (
                                <button
                                    onClick={() => removeCollection(item.id)}
                                    className="text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {item.ringtone ? (
                            <div className="relative bg-zinc-50 rounded-lg p-2 flex gap-2 items-center group/card border border-transparent hover:border-[#E5EBF1]">
                                <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-zinc-200">
                                    {item.ringtone.poster_url && (
                                        <ImageWithFallback src={getImageUrl(item.ringtone.poster_url)} alt={item.ringtone.title} fill className="object-cover" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[#15171A] truncate">{item.ringtone.title}</p>
                                    <p className="text-[10px] text-zinc-500 truncate">{item.ringtone.movie_name}</p>
                                </div>
                                <button
                                    onClick={() => removeRingtone(item.id)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/search?assignTo=${item.id}&q=${item.label}`}
                                className="w-full py-2 rounded-lg border border-dashed border-zinc-300 text-zinc-500 text-xs text-center hover:bg-zinc-50 hover:text-[#3EB0EF] hover:border-[#3EB0EF]/50 transition-all flex items-center justify-center gap-1"
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
