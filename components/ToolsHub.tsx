'use client';

import React from 'react';
import { ArrowRight, Scissors, Mic2, Music2, Wand2, Ghost, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEditor } from '@/app/tools/editor-context';
import { M3Card, M3Button, M3Badge } from '@/components/ui/m3';

type ToolMode = 'fx' | 'vocal' | 'karaoke';

interface ToolCardProps {
    mode: ToolMode;
    icon: React.ElementType;
    title: string;
    subtitle: string;
    isComingSoon?: boolean;
    href?: string;
    onSelect: (mode: ToolMode, file: File) => void;
}

const ToolCard = ({
    mode,
    icon: Icon,
    title,
    subtitle,
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
            className="block"
        >
            <M3Card
                variant="elevated"
                interactive={!isComingSoon}
                className={`p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all ${
                    isComingSoon ? 'opacity-70 cursor-not-allowed bg-m3-surface-container-low/60' : 'cursor-pointer'
                }`}
            >
                {!href && (
                    <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r,.ogg"
                        className="hidden"
                        disabled={isComingSoon}
                        onChange={handleFileChange}
                        onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                    />
                )}

                {/* M3 48x48dp Tonal Icon Container */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 ${
                    isComingSoon
                        ? 'bg-m3-surface-container-highest text-m3-outline'
                        : 'bg-m3-primary-container text-m3-on-primary-container group-hover:scale-110'
                }`}>
                    <Icon size={22} />
                </div>

                {/* Title */}
                <h3 className={`text-sm sm:text-base font-bold leading-snug mb-0.5 ${
                    isComingSoon ? 'text-m3-outline' : 'text-m3-on-surface'
                }`}>
                    {title}
                </h3>

                {/* Subtitle */}
                <p className="text-[10px] font-medium text-m3-outline uppercase tracking-wider mb-3">
                    {subtitle}
                </p>

                {/* Action Indicator / Button */}
                <div className="mt-auto">
                    {isComingSoon ? (
                        <M3Badge variant="surface" className="text-[10px] px-2.5 py-0.5 font-semibold">
                            Soon
                        </M3Badge>
                    ) : (
                        <M3Button
                            variant="tonal"
                            className="h-8 px-3.5 text-xs font-semibold gap-1.5"
                            trailingIcon={<ArrowRight size={13} />}
                        >
                            {href ? 'Open' : 'Upload'}
                        </M3Button>
                    )}
                </div>
            </M3Card>
        </Container>
    );
};

export default function ToolsHub() {
    const router = useRouter();
    const { setEditorData } = useEditor();

    const handleToolSelect = (mode: ToolMode, file: File) => {
        setEditorData(file, mode);

        const routes: Record<ToolMode, string> = {
            fx: '/tools/cutter',
            vocal: '/tools/vocal-remover',
            karaoke: '/tools/karaoke'
        };

        router.push(routes[mode] || '/tools/editor');
    };

    return (
        <main className="max-w-4xl mx-auto px-3 sm:px-4">
            {/* M3 Headline Header */}
            <header className="text-center mb-6 space-y-1 pt-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-m3-on-surface tracking-tight">
                    Studio <span className="text-m3-primary">Tools</span>
                </h1>
                <p className="text-m3-on-surface-variant text-xs sm:text-sm max-w-sm mx-auto font-medium">
                    Professional browser-side audio editing. Pick a tool to begin.
                </p>
            </header>

            {/* M3 Card Grid */}
            <div className="max-w-lg mx-auto grid grid-cols-2 gap-3 sm:gap-4">
                <ToolCard
                    mode="fx"
                    icon={Scissors}
                    title="Cutter"
                    subtitle="Manual Trim"
                    onSelect={handleToolSelect}
                />

                <ToolCard
                    mode="vocal"
                    icon={Mic2}
                    title="Vocals"
                    subtitle="Voice Extractor"
                    isComingSoon={true}
                    onSelect={handleToolSelect}
                />

                <ToolCard
                    mode="karaoke"
                    icon={Music2}
                    title="Karaoke"
                    subtitle="Instrumental"
                    isComingSoon={true}
                    onSelect={handleToolSelect}
                />

                <ToolCard
                    mode="fx"
                    icon={Sparkles}
                    title="Name Tone"
                    subtitle="Generator"
                    href="/tools/name-ringtone"
                    isComingSoon={true}
                    onSelect={handleToolSelect}
                />

                <ToolCard
                    mode="fx"
                    icon={Wand2}
                    title="AI Enhance"
                    subtitle="Noise Remover"
                    isComingSoon={true}
                    onSelect={handleToolSelect}
                />

                <ToolCard
                    mode="fx"
                    icon={Ghost}
                    title="Voice Changer"
                    subtitle="Funny Effects"
                    isComingSoon={true}
                    onSelect={handleToolSelect}
                />
            </div>
        </main>
    );
}
