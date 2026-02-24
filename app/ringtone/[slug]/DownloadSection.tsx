'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { Ringtone } from '@/types';
import PlayButton from './PlayButton';
import DownloadButton from './DownloadButton';

interface DownloadSectionProps {
    ringtone: Ringtone;
}

export default function DownloadSection({ ringtone }: DownloadSectionProps) {
    const [downloadCount, setDownloadCount] = useState(ringtone.downloads || 0);
    const [hasIncremented, setHasIncremented] = useState(false);

    const handleDownload = () => {
        if (!hasIncremented) {
            setDownloadCount(prev => prev + 1);
            setHasIncremented(true);
        }
    };

    return (
        <>
            {/* Play & Download Buttons */}
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <PlayButton ringtone={ringtone} />
                    <div className="flex-1 min-w-[140px]">
                        <DownloadButton 
                            ringtone={ringtone} 
                            onDownload={handleDownload}
                        />
                    </div>
                </div>
            </div>

            {/* Social Proof Badge */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500 mt-1">
                {ringtone.profile?.full_name && (
                    <>
                        <span className="flex items-center gap-1">
                            Uploaded by
                            <Link
                                href={`/user/${ringtone.profile.id}`}
                                className="text-brand-accent hover:underline decoration-brand-accent/30 underline-offset-2 transition-all"
                            >
                                {ringtone.profile.full_name}
                            </Link>
                        </span>
                        <span className="text-zinc-300 mx-1">|</span>
                    </>
                )}
                <Download size={14} className="text-brand-accent/80" />
                <span>
                    <span className="text-brand-dark">
                        {downloadCount.toLocaleString()}
                    </span> people downloaded this
                </span>
            </div>
        </>
    );
}
