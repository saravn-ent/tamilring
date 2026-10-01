import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
            <div className="bg-m3-surface-container-low p-8 rounded-3xl border border-m3-outline-variant/30 max-w-md w-full shadow-sm">
                <h1 className="text-8xl font-black text-m3-primary mb-2 font-mono tracking-tighter opacity-20">404</h1>
                <div className="-mt-8 mb-6">
                    <h2 className="text-2xl font-display font-black text-m3-on-surface mb-2">Page Not Found</h2>
                    <p className="text-m3-on-surface-variant font-medium text-sm">
                        The ringtone or page you are looking for might have been removed or renamed.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold rounded-xl transition-all active:scale-95 shadow-md"
                    >
                        <Home size={20} strokeWidth={2.5} />
                        Go Home
                    </Link>

                    <Link
                        href="/search"
                        className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface font-bold rounded-xl transition-colors border border-m3-outline-variant/30"
                    >
                        <Search size={20} strokeWidth={2.5} />
                        Search Ringtones
                    </Link>
                </div>
            </div>
        </div>
    );
}
