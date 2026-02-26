'use client';

import { useState } from 'react';
import { Download, Heart } from 'lucide-react';
import Link from 'next/link';
import { Ringtone } from '@/types';
import PlayButton from './PlayButton';
import DownloadButton from './DownloadButton';
import LikeButton from './LikeButton';

interface DownloadSectionProps {
    ringtone: Ringtone;
}

export default function DownloadSection({ ringtone }: DownloadSectionProps) {
    const [downloadCount, setDownloadCount] = useState(ringtone.downloads || 0);
    const [likeCount, setLikeCount] = useState(ringtone.likes || 0);
    const [hasIncremented, setHasIncremented] = useState(false);

    const handleDownload = () => {
        if (!hasIncremented) {
            setDownloadCount(prev => prev + 1);
            setHasIncremented(true);
        }
    };

    return (
        <>
            {/* Play, Download & Like Buttons */}
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                <div className="grid grid-cols-2 gap-3 w-full">
                    <PlayButton ringtone={ringtone} />
                    <LikeButton 
                        ringtone={ringtone} 
                        onLike={(count: number) => setLikeCount(count)}
                    />
                    <div className="col-span-2">
                        <DownloadButton 
                            ringtone={ringtone} 
                            onDownload={handleDownload}
                        />
                    </div>
                </div>
            </div>

            {/* Social Proof Badge */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold text-zinc-500 mt-2">
                <div className="flex items-center gap-1.5">
                    <Download size={14} className="text-brand-accent/80" />
                    <span>
                        <span className="text-brand-dark">
                            {downloadCount.toLocaleString()}
                        </span> downloads
                    </span>
                </div>
                <span className="text-zinc-300">|</span>
                <div className="flex items-center gap-1.5">
                    <Heart size={14} className="text-rose-500/80 fill-rose-500/20" />
                    <span>
                        <span className="text-brand-dark">
                            {likeCount.toLocaleString()}
                        </span> likes
                    </span>
                </div>

                {ringtone.profile?.full_name && (
                    <>
                        <span className="text-zinc-300">|</span>
                        <span className="flex items-center gap-1">
                            By
                            <Link
                                href={`/user/${ringtone.profile.id}`}
                                className="text-brand-accent hover:underline decoration-brand-accent/30 underline-offset-2 transition-all"
                            >
                                {ringtone.profile.full_name}
                            </Link>
                        </span>
                    </>
                )}
            </div>
        </>
    );
}
