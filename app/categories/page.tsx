'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Heart, Zap, Frown, Music, Mic2, Disc, Guitar, Wind, Moon, Dumbbell, Plane, Sparkles, Flame, Smile, Clock } from 'lucide-react';

export default function DiscoveryHub() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const MOODS = [
    { name: "Love", icon: Heart, color: "text-rose-400" },
    { name: "Mass", icon: Zap, color: "text-amber-400" },
    { name: "Sad", icon: Frown, color: "text-blue-400" },
    { name: "BGM", icon: Music, color: "text-emerald-400" },
    { name: "Funny", icon: Smile, color: "text-orange-400" },
    { name: "Melody", icon: Mic2, color: "text-purple-400" },
  ];

  const ERAS = [
    { label: "80s", query: "80s", color: "from-pink-500/20 to-purple-500/20" },
    { label: "90s", query: "90s", color: "from-cyan-500/20 to-blue-500/20" },
    { label: "2K Kids", query: "2000s", color: "from-emerald-500/20 to-teal-500/20" },
    { label: "2024", query: "2024", color: "from-orange-500/20 to-red-500/20" }
  ];

  const INSTRUMENTS = [
    { label: "Flute", icon: Wind, query: "flute" },
    { label: "Violin", icon: Music, query: "violin" },
    { label: "Guitar", icon: Guitar, query: "guitar" },
    { label: "Piano", icon: Disc, query: "piano" }
  ];

  const COLLECTIONS = [
    { label: "Sleep", icon: Moon, query: "sleep", desc: "Calming tunes", color: "bg-indigo-500/10 text-indigo-400" },
    { label: "Workout", icon: Dumbbell, query: "workout", desc: "High energy", color: "bg-rose-500/10 text-rose-400" },
    { label: "Travel", icon: Plane, query: "travel", desc: "Road trip vibes", color: "bg-sky-500/10 text-sky-400" }
  ];

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">Discover</h1>
        <p className="text-zinc-400 text-sm">Find your perfect ringtone</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-8 group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Find songs, artists, or bgm..."
          className="w-full bg-neutral-800/50 backdrop-blur-md border border-white/10 text-white text-sm rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-lg shadow-black/20 placeholder:text-zinc-500"
        />
      </form>

      {/* By Mood */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-white">By Mood</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {MOODS.map((mood) => (
            <Link 
              key={mood.name} 
              href={`/mood/${mood.name}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-800/50 border border-white/5 hover:bg-neutral-700 hover:border-emerald-500/30 transition-all shrink-0 group"
            >
              <mood.icon size={16} className={`${mood.color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm font-medium text-zinc-200 group-hover:text-white">{mood.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* By Era */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-white">By Era</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ERAS.map((era) => (
            <Link 
              key={era.label}
              href={`/search?q=${era.query}`}
              className={`relative h-24 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${era.color} border border-white/5 hover:scale-[1.02] transition-transform group`}
            >
              <div className="absolute inset-0 bg-neutral-900/20 group-hover:bg-transparent transition-colors" />
              <span className="relative text-xl font-bold text-white tracking-wider drop-shadow-lg">{era.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Instruments */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Music size={16} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-white">Instruments</h2>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {INSTRUMENTS.map((inst) => (
            <Link 
              key={inst.label}
              href={`/search?q=${inst.query}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-neutral-800/30 border border-white/5 hover:bg-neutral-800 hover:border-emerald-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-700/50 flex items-center justify-center text-zinc-300">
                <inst.icon size={18} />
              </div>
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">{inst.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-white">Collections</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COLLECTIONS.map((col) => (
            <Link 
              key={col.label}
              href={`/search?q=${col.query}`}
              className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-800/30 border border-white/5 hover:bg-neutral-800 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${col.color}`}>
                <col.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">{col.label}</h3>
                <p className="text-xs text-zinc-500">{col.desc}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 transition-colors">
                <Search size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
