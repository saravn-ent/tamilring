'use client';

import { useState } from 'react';
import { Download, Loader2, Smartphone, Monitor } from 'lucide-react';
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
            // 1. Detect device
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

            // 2. Select URL
            let targetUrl = ringtone.audio_url;
            let targetExt = 'mp3';

            if (isIOS && ringtone.audio_url_iphone) {
                targetUrl = ringtone.audio_url_iphone;
                targetExt = 'm4r';
            }

            // 3. Increment count immediately for UI
            setDownloadCount(prev => prev + 1);

            // 4. Fire and forget server increment
            incrementDownloads(ringtone.id);

            // 5. Fetch the file
            const response = await fetch(targetUrl);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // 6. Create temporary link and click it
            const link = document.createElement('a');
            link.href = url;

            const filename = `${ringtone.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_tamilring.${targetExt}`;
            link.download = filename;

            document.body.appendChild(link);
            link.click();

            // 7. Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
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
        </button>
    );
}
