import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
            <div className="bg-neutral-800/50 p-8 rounded-2xl border border-white/5 max-w-md w-full backdrop-blur-sm">
                <h1 className="text-6xl font-black text-emerald-500 mb-4 font-mono">404</h1>
                <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
                <p className="text-zinc-400 mb-8">
                    The ringtone or page you are looking for might have been removed or renamed.
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all active:scale-95"
                    >
                        <Home size={20} />
                        Go Home
                    </Link>

                    <Link
                        href="/search"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-xl transition-colors"
                    >
                        <Search size={20} />
                        Search Ringtones
                    </Link>
                </div>
            </div>
        </div>
    );
}
