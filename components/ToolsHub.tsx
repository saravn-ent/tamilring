'use client';

import { ArrowRight, Scissors, Mic2, Music2, Type, Wand2, Ghost } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEditor } from '@/app/tools/editor-context';

type ToolMode = 'fx' | 'vocal' | 'karaoke';

export default function ToolsHub() {
    const router = useRouter();
    const { setEditorData } = useEditor();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, mode: ToolMode) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditorData(file, mode);

            // Map modes to specific tool routes
            const routes: Record<ToolMode, string> = {
                fx: '/tools/cutter',
                vocal: '/tools/vocal-remover',
                karaoke: '/tools/karaoke'
            };

            router.push(routes[mode] || '/tools/editor');
        }
    };

    const ToolCard = ({
        mode,
        icon: Icon,
        title,
        subtitle,
        colorClass,
        gradientClass,
        shadowClass,
        rotateClass,
        isComingSoon = false
    }: {
        mode: ToolMode,
        icon: any,
        title: string,
        subtitle: string,
        colorClass: string,
        gradientClass: string,
        shadowClass: string,
        rotateClass: string,
        isComingSoon?: boolean
    }) => (
        <label className={`group relative overflow-hidden rounded-[2rem] p-5 sm:p-6 border border-slate-100 shadow-sm ${isComingSoon ? 'opacity-80 cursor-not-allowed' : `cursor-pointer hover:shadow-xl ${shadowClass} hover:-translate-y-1`} transition-all duration-300 aspect-[4/5] flex flex-col items-center justify-center text-center`}>
            <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r,.ogg"
                className="hidden"
                disabled={isComingSoon}
                onChange={(e) => handleFileSelect(e, mode)}
                onClick={(e) => (e.target as any).value = null} // Allow re-selecting same file
            />
            <div className={`absolute inset-0 ${gradientClass} opacity-0 ${!isComingSoon && 'group-hover:opacity-100'} transition-opacity`} />

            <div className={`w-14 h-14 sm:w-16 sm:h-16 ${isComingSoon ? 'bg-slate-100 text-slate-400' : `${colorClass} text-white group-hover:scale-110`} rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${rotateClass}`}>
                <Icon size={28} className="sm:w-8 sm:h-8" />
            </div>

            <div className="flex items-center gap-1.5 mb-1 justify-center">
                <h3 className={`text-lg sm:text-xl font-bold leading-tight ${isComingSoon ? 'text-slate-400' : 'text-slate-900'}`}>{title}</h3>

            </div>

            <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider mb-4">{subtitle}</p>

            <div className={`mt-auto flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${isComingSoon
                ? 'bg-slate-100 text-slate-400'
                : mode === 'fx'
                    ? 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white'
                    : mode === 'vocal'
                        ? 'text-violet-600 bg-violet-50 group-hover:bg-violet-600 group-hover:text-white'
                        : 'text-teal-600 bg-teal-50 group-hover:bg-teal-600 group-hover:text-white'
                }`}>
                {isComingSoon ? 'Coming Soon' : <>Upload <ArrowRight size={12} /></>}
            </div>
        </label>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 space-y-3">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Studio <span className="text-indigo-500">Tools</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm md:text-base max-w-md mx-auto">
                    Select a tool and upload your song to start editing instantly.
                </p>
            </div>

            <div className="max-w-lg mx-auto grid grid-cols-2 gap-3 sm:gap-4">
                <ToolCard
                    mode="fx"
                    icon={Scissors}
                    title="Cutter"
                    subtitle="Manual Trim"
                    colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30"
                    gradientClass="bg-gradient-to-br from-indigo-500/5 to-purple-500/5"
                    shadowClass="hover:shadow-indigo-500/20"
                    rotateClass="rotate-3 group-hover:rotate-6"
                />



                <ToolCard
                    mode="vocal"
                    icon={Mic2}
                    title="Vocals"
                    subtitle="Voice Extractor"
                    colorClass="bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/30"
                    gradientClass="bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5"
                    shadowClass="hover:shadow-violet-500/20"
                    rotateClass="rotate-2 group-hover:rotate-4"
                    isComingSoon={true}
                />

                <ToolCard
                    mode="karaoke"
                    icon={Music2}
                    title="Karaoke"
                    subtitle="Instrumental"
                    colorClass="bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30"
                    gradientClass="bg-gradient-to-br from-teal-500/5 to-emerald-500/5"
                    shadowClass="hover:shadow-teal-500/20"
                    rotateClass="-rotate-2 group-hover:-rotate-4"
                    isComingSoon={true}
                />

                {/* NEW AI FEATURES */}
                <ToolCard
                    mode="fx" // generic mode for coming soon
                    icon={Type}
                    title="Name Ringtone"
                    subtitle="AI Text to Speech"
                    colorClass="bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30"
                    gradientClass="bg-gradient-to-br from-orange-500/5 to-yellow-500/5"
                    shadowClass="hover:shadow-orange-500/20"
                    rotateClass="rotate-1 group-hover:rotate-3"
                    isComingSoon={true}
                />

                <ToolCard
                    mode="fx"
                    icon={Wand2}
                    title="AI Enhance"
                    subtitle="Noise Remover"
                    colorClass="bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30"
                    gradientClass="bg-gradient-to-br from-cyan-500/5 to-blue-500/5"
                    shadowClass="hover:shadow-cyan-500/20"
                    rotateClass="-rotate-1 group-hover:-rotate-3"
                    isComingSoon={true}
                />

                <ToolCard
                    mode="fx"
                    icon={Ghost}
                    title="Voice Changer"
                    subtitle="Funny Effects"
                    colorClass="bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-fuchsia-500/30"
                    gradientClass="bg-gradient-to-br from-fuchsia-500/5 to-pink-500/5"
                    shadowClass="hover:shadow-fuchsia-500/20"
                    rotateClass="rotate-2 group-hover:rotate-4"
                    isComingSoon={true}
                />
            </div>
        </div>
    );
}
