'use client';

import dynamic from 'next/dynamic';

const NameRingtone = dynamic(() => import('@/components/NameRingtone'), {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-slate-400 font-bold tracking-widest text-xs">LOADING AI ENGINE...</div>
});

export default function NameRingtoneUI() {
    return <NameRingtone />;
}
