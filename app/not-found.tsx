import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center bg-white">
            <div className="bg-white p-8 rounded-3xl border border-brand-border max-w-md w-full shadow-xl shadow-brand-dark/5">
                <h1 className="text-8xl font-black text-brand-accent mb-2 font-mono tracking-tighter opacity-20">404</h1>
                <div className="-mt-8 mb-6">
                    <h2 className="text-2xl font-black text-brand-dark mb-2">Page Not Found</h2>
                    <p className="text-zinc-600 font-medium">
                        The ringtone or page you are looking for might have been removed or renamed.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-brand-dark hover:bg-neutral-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-dark/20"
                    >
                        <Home size={20} strokeWidth={2.5} />
                        Go Home
                    </Link>

                    <Link
                        href="/search"
                        className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-brand-wash hover:bg-zinc-100 text-brand-dark font-bold rounded-xl transition-colors border border-transparent hover:border-brand-border"
                    >
                        <Search size={20} strokeWidth={2.5} />
                        Search Ringtones
                    </Link>
                </div>
            </div>
        </div>
    );
}
