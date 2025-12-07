'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Ringtone } from '@/types';
import { incrementDownloads } from '@/app/actions';

interface DownloadButtonProps {
    ringtone: Ringtone;
}

export default function DownloadButton({ ringtone }: DownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadCount, setDownloadCount] = useState(ringtone.downloads || 0);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isDownloading) return;

        setIsDownloading(true);

        try {
            // 1. Increment count immediately for UI
            setDownloadCount(prev => prev + 1);

            // 2. Fire and forget server increment
            incrementDownloads(ringtone.id);

            // 3. Fetch the file
            const response = await fetch(ringtone.audio_url);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // 4. Create temporary link and click it
            const link = document.createElement('a');
            link.href = url;
            // Use logic to determine filename, fallback to slug or title
            const extension = ringtone.audio_url.split('.').pop() || 'mp3';
            const filename = `${ringtone.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_tamilring.${extension}`;
            link.download = filename;

            document.body.appendChild(link);
            link.click();

            // 5. Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            // Revert count on error if critical, but for simple counters usually fine to leave or add toast
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 bg-neutral-800 text-zinc-100 font-bold py-4 rounded-xl hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isDownloading ? (
                <Loader2 size={20} className="animate-spin" />
            ) : (
                <Download size={20} />
            )}
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
            {/* Optional: Show count in button or separately? keeping it clean as per original design for now, 
           but original didn't show count inside this main big button. 
           Wait, looking at screenshot, it says "Download" big. 
       */}
        </button>
    );
}
