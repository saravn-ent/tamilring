
import React from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
            <div className="bg-neutral-900 p-6 rounded-full mb-6">
                <WifiOff size={48} className="text-zinc-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">No Internet Connection</h1>
            <p className="text-zinc-400 max-w-sm mb-8">
                It seems you are offline. Check your connection or enjoy the ringtones you've already visited.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-emerald-500 text-neutral-900 font-bold rounded-xl hover:bg-emerald-400 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
}
