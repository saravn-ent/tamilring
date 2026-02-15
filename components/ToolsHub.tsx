'use client';

import { ArrowRight, Scissors, Mic2, Music2, Type, Wand2, Ghost, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEditor } from '@/app/tools/editor-context';

type ToolMode = 'fx' | 'vocal' | 'karaoke';

interface ToolCardProps {
    mode: ToolMode;
    icon: any;
    title: string;
    subtitle: string;
    colorClass: string;
    gradientClass: string;
    shadowClass: string;
    rotateClass: string;
    isComingSoon?: boolean;
    href?: string;
    onSelect: (mode: ToolMode, file: File) => void;
}

const ToolCard = ({
    mode,
    icon: Icon,
    title,
    subtitle,
    colorClass,
    gradientClass,
    shadowClass,
    rotateClass,
    isComingSoon = false,
    href,
    onSelect
}: ToolCardProps) => {
    const router = useRouter();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onSelect(mode, e.target.files[0]);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (isComingSoon) {
            e.preventDefault();
            return;
        }
        if (href) {
            e.preventDefault();
            router.push(href);
        }
    };

    const Container = href ? 'div' : 'label';

    return (
        <Container
            onClick={handleClick}
            className={`group relative overflow-hidden rounded-2xl p-4 border border-slate-100 shadow-sm ${isComingSoon ? 'opacity-80 cursor-not-allowed' : `cursor-pointer hover:shadow-lg ${shadowClass}`} transition-all duration-300 flex flex-col items-center justify-center text-center`}
        >
            {!href && (
                <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r,.ogg"
                    className="hidden"
                    disabled={isComingSoon}
                    onChange={handleFileChange}
                    onClick={(e) => { (e.target as any).value = null; }} // Allow re-selecting same file
                />
            )}
            <div className={`absolute inset-0 ${gradientClass} opacity-0 ${!isComingSoon ? 'group-hover:opacity-100' : ''} transition-opacity`} />

            <div className={`w-10 h-10 ${isComingSoon ? 'bg-slate-100 text-slate-400' : `${colorClass} text-white group-hover:scale-105`} rounded-xl flex items-center justify-center mb-2 transition-transform duration-300 ${rotateClass}`}>
                <Icon size={18} />
            </div>

            <div className="flex items-center gap-1.5 mb-0.5 justify-center">
                <h3 className={`text-sm font-black leading-tight ${isComingSoon ? 'text-slate-400' : 'text-slate-900'}`}>{title}</h3>
            </div>

            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">{subtitle}</p>

            <div className={`mt-auto flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full border transition-colors ${isComingSoon
                ? 'bg-slate-50 text-slate-400 border-slate-100'
                : mode === 'fx'
                    ? 'text-indigo-600 bg-indigo-50 border-indigo-100'
                    : mode === 'vocal'
                        ? 'text-violet-600 bg-violet-50 border-violet-100'
                        : 'text-teal-600 bg-teal-50 border-teal-100'
                }`}>
                {isComingSoon ? 'Soon' : <>{href ? 'Open' : 'Upload'} <ArrowRight size={10} /></>}
            </div>
        </Container>
    );
};

export default function ToolsHub() {
    const router = useRouter();
    const { setEditorData } = useEditor();

    const handleToolSelect = (mode: ToolMode, file: File) => {
        setEditorData(file, mode);

        // Map modes to specific tool routes
        const routes: Record<ToolMode, string> = {
            fx: '/tools/cutter',
            vocal: '/tools/vocal-remover',
            karaoke: '/tools/karaoke'
        };

        router.push(routes[mode] || '/tools/editor');
    };

    return (
        <main className="max-w-4xl mx-auto px-2">
            <header className="text-center mb-6 space-y-1">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Studio <span className="text-indigo-500">Tools</span>
                </h1>
                <p className="text-slate-500 font-bold text-[10px] md:text-sm max-w-xs mx-auto">
                    Professional browser-side audio editing. Pick a tool to begin.
                </p>

                {/* Hidden SEO content for better indexing */}
                <div className="sr-only">
                    <h2>Free Online Audio Editing Tools</h2>
                    <p>
                        TamilRing offers a complete suite of professional audio editing tools that work directly in your browser.
                        Create perfect ringtones, remove vocals, make karaoke tracks, and enhance your audio files with AI-powered tools.
                        All tools are completely free, require no registration, and process files locally for maximum privacy.
                    </p>
                </div>
            </header>

            <div className="max-w-lg mx-auto grid grid-cols-2 gap-3 sm:gap-4">
                <ToolCard
                    mode="fx"
                    icon={Scissors}
                    title="Cutter"
                    subtitle="Manual Trim"
                    colorClass="bg-linear-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30"
                    gradientClass="bg-linear-to-br from-indigo-500/5 to-purple-500/5"
                    shadowClass="hover:shadow-indigo-500/20"
                    rotateClass="rotate-3 group-hover:rotate-6"
                    onSelect={handleToolSelect}
                />

                <ToolCard
                    mode="vocal"
                    icon={Mic2}
                    title="Vocals"
                    subtitle="Voice Extractor"
                    colorClass="bg-linear-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/30"
                    gradientClass="bg-linear-to-br from-violet-500/5 to-fuchsia-500/5"
                    shadowClass="hover:shadow-violet-500/20"
                    rotateClass="rotate-2 group-hover:rotate-4"
                    isComingSoon={true}
                    onSelect={handleToolSelect}
                />

                <ToolCard
                    mode="karaoke"
                    icon={Music2}
                    title="Karaoke"
                    subtitle="Instrumental"
                    colorClass="bg-linear-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/30"
                    gradientClass="bg-linear-to-br from-teal-500/5 to-emerald-500/5"
                    shadowClass="hover:shadow-teal-500/20"
                    rotateClass="-rotate-2 group-hover:-rotate-4"
                    isComingSoon={true}
                    onSelect={handleToolSelect}
                />

                <ToolCard
                    mode="fx"
                    icon={Sparkles}
                    title="Name Tone"
                    subtitle="Generator"
                    colorClass="bg-linear-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30"
                    gradientClass="bg-linear-to-br from-rose-500/5 to-pink-500/5"
                    shadowClass="hover:shadow-rose-500/20"
                    rotateClass="rotate-3 group-hover:rotate-6"
                    href="/tools/name-ringtone"
                    isComingSoon={true}
                    onSelect={handleToolSelect}
                />



                <ToolCard
                    mode="fx"
                    icon={Wand2}
                    title="AI Enhance"
                    subtitle="Noise Remover"
                    colorClass="bg-linear-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30"
                    gradientClass="bg-linear-to-br from-cyan-500/5 to-blue-500/5"
                    shadowClass="hover:shadow-cyan-500/20"
                    rotateClass="-rotate-1 group-hover:-rotate-3"
                    isComingSoon={true}
                    onSelect={handleToolSelect}
                />

                <ToolCard
                    mode="fx"
                    icon={Ghost}
                    title="Voice Changer"
                    subtitle="Funny Effects"
                    colorClass="bg-linear-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-fuchsia-500/30"
                    gradientClass="bg-linear-to-br from-fuchsia-500/5 to-pink-500/5"
                    shadowClass="hover:shadow-fuchsia-500/20"
                    rotateClass="rotate-2 group-hover:rotate-4"
                    isComingSoon={true}
                    onSelect={handleToolSelect}
                />
            </div>
        </main>
    );
}
