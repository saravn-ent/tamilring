import Link from 'next/link';
import { Guitar, Keyboard } from 'lucide-react';
import { VeenaIcon, TrumpetIcon, WhistleIcon, SaxophoneIcon, FluteIcon, ViolinIcon, NadaswaramIcon, DrumsIcon } from './InstrumentIcons';
import { ERAS, INSTRUMENTS } from '@/lib/constants';

const ICON_MAP: Record<string, any> = {
    flute: FluteIcon,
    violin: ViolinIcon,
    guitar: Guitar,
    piano: Keyboard,
    keyboard: Keyboard,
    whistle: WhistleIcon,
    saxophone: SaxophoneIcon,
    veena: VeenaIcon,
    trumpet: TrumpetIcon,
    nadaswaram: NadaswaramIcon,
    drums: DrumsIcon
};

export default function EraAndInstruments() {
    return (
        <div className="space-y-8 mb-10 px-4">
            {/* By Era Section */}
            <section>
                <div className="mb-4 px-1">
                    <h2 className="text-lg font-bold text-brand-dark">By Era</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {ERAS.map((era) => {
                        let colorClass = era.color;
                        if (era.label === '70s') colorClass = "from-amber-400 via-orange-400 to-yellow-500";
                        if (era.label === '80s') colorClass = "from-fuchsia-400 via-pink-500 to-purple-500";
                        if (era.label === '90s') colorClass = "from-blue-400 via-indigo-400 to-purple-400";
                        if (era.label === '2ks') colorClass = "from-sky-300 via-cyan-300 to-blue-400";
                        if (era.label === '2k10s') colorClass = "from-teal-300 via-emerald-400 to-green-400";
                        if (era.label === '2k20s') colorClass = "from-gray-600 via-slate-600 to-zinc-700";

                        return (
                            <Link
                                key={era.label}
                                href={`/search?q=${encodeURIComponent(era.label)}&hideSearch=true`}
                                className={`relative h-20 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${colorClass} hover:scale-[1.02] transition-transform shadow-sm group`}
                            >
                                <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
                                <span className="relative text-lg font-black italic text-white tracking-widest opacity-100 drop-shadow-md">{era.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </section>

            {/* Instruments Section */}
            <section>
                <div className="mb-4 px-1">
                    <h2 className="text-lg font-bold text-brand-dark">Instruments</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x pt-1">
                    {INSTRUMENTS.map((inst) => {
                        const Icon = ICON_MAP[inst.query];
                        return (
                            <Link
                                key={inst.label}
                                href={`/search?q=${encodeURIComponent(inst.query)}&hideSearch=true`}
                                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md hover:border-brand-accent/30 transition-all snap-start shrink-0 min-w-[85px]"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-wash flex items-center justify-center text-brand-accent">
                                    {Icon && <Icon size={20} strokeWidth={2} />}
                                </div>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide">{inst.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
