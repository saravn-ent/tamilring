import Link from 'next/link';

export default function LegalFooter() {
    return (
        <footer className="text-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
                <Link href="/legal/dmca" className="text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                    <span className="text-base">⚖️</span>
                    <span>DMCA</span>
                </Link>
                <span className="text-zinc-700">•</span>
                <Link href="/legal/terms" className="text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                    <span className="text-base">📄</span>
                    <span>Terms</span>
                </Link>
                <span className="text-zinc-700">•</span>
                <Link href="/privacy" className="text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                    <span className="text-base">🛡️</span>
                    <span>Privacy</span>
                </Link>
                <span className="text-zinc-700">•</span>
                <Link href="/contact" className="text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                    <span className="text-base">💬</span>
                    <span>Support</span>
                </Link>
            </div>
            <p className="text-[11px] text-zinc-600">
                TamilRing © 2025 • User Generated Content
            </p>
        </footer>
    );
}
