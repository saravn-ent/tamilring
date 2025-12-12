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
                className="w-14 h-14 bg-neutral-800 text-emerald-500 rounded-xl hover:bg-neutral-700 transition-all flex items-center justify-center active:scale-95 border border-transparent hover:border-emerald-500/30"
                title="Create Video"
            >
                <Video size={24} />
            </button>

            <VideoGeneratorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                ringtone={ringtone}
            />
        </>
    );
}
