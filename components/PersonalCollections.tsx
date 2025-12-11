'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Music, User, X, Search } from 'lucide-react';
import { Ringtone } from '@/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newEmoji, setNewEmoji] = useState('👤');
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem('user_collections');
        if (saved) {
            setCollections(JSON.parse(saved));
        } else {
            setCollections(DEFAULT_COLLECTIONS);
            localStorage.setItem('user_collections', JSON.stringify(DEFAULT_COLLECTIONS));
        }
    }, []);

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
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <User size={20} className="text-emerald-500" />
                    For My
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs text-emerald-500 font-medium hover:underline flex items-center gap-1"
                >
                    <Plus size={14} /> Add Person
                </button>
            </div>

            {isAdding && (
                <div className="mb-4 p-3 bg-neutral-800 rounded-xl border border-neutral-700 flex gap-2 items-center animate-in fade-in slide-in-from-top-2">
                    <select
                        value={newEmoji}
                        onChange={(e) => setNewEmoji(e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-2 text-lg focus:outline-none focus:border-emerald-500"
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
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        autoFocus
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-emerald-500 text-black px-3 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400"
                    >
                        Add
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {collections.map((item) => (
                    <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 relative group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{item.emoji}</span>
                                <span className="font-medium text-zinc-200 text-sm truncate max-w-[80px]">{item.label}</span>
                            </div>
                            {!DEFAULT_COLLECTIONS.find(d => d.id === item.id) && (
                                <button
                                    onClick={() => removeCollection(item.id)}
                                    className="text-zinc-600 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {item.ringtone ? (
                            <div className="relative bg-neutral-800 rounded-lg p-2 flex gap-2 items-center group/card">
                                <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-neutral-700">
                                    {item.ringtone.poster_url && (
                                        <Image src={item.ringtone.poster_url} alt={item.ringtone.title} fill className="object-cover" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-white truncate">{item.ringtone.title}</p>
                                    <p className="text-[10px] text-zinc-500 truncate">{item.ringtone.movie_name}</p>
                                </div>
                                <button
                                    onClick={() => removeRingtone(item.id)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href={`/search?assignTo=${item.id}&q=${item.label}`}
                                className="block w-full py-2 rounded-lg border border-dashed border-neutral-700 text-zinc-500 text-xs text-center hover:bg-neutral-800 hover:text-emerald-500 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-1"
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
