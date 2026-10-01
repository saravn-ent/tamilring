'use client';

import { useState } from 'react';
import { Video } from 'lucide-react';
import { Ringtone } from '@/types';
import VideoGeneratorModal from '@/components/VideoGeneratorModal';

interface VideoDownloadButtonProps {
    ringtone: Ringtone;
}

export default function VideoDownloadButton({ ringtone }: VideoDownloadButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 text-m3-on-surface hover:text-m3-primary bg-m3-surface-container border border-m3-outline-variant/30 hover:bg-m3-surface-container-high px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                title="Create Video"
            >
                <Video size={20} strokeWidth={2.5} />
                <span className="text-base font-semibold">Video</span>
            </button>

            <VideoGeneratorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                ringtone={ringtone}
            />
        </>
    );
}
