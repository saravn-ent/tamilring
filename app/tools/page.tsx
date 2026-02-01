import { Suspense } from 'react';
import ToolsHub from '@/components/ToolsHub';

export const metadata = {
    title: 'Information about TamilRing Audio Tools',
    description: 'Free online audio tools including MP3 Cutter, Vocal Remover, Karaoke Maker, and Smart AI Trimming.',
};

export default function ToolsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <ToolsHub />
        </div>
    );
}
