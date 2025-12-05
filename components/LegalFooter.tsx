import Link from 'next/link';

export default function LegalFooter() {
    return (
        <footer className="py-8 pb-24 text-center">
            <div className="max-w-xs mx-auto">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
                    <Link href="/legal/dmca" className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
                        ⚖️ DMCA / Copyright
                    </Link>
                    <Link href="/legal/terms" className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
                        📄 Terms of Service
                    </Link>
                    <Link href="/privacy" className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
                        🛡️ Privacy Policy
                    </Link>
                    <Link href="/contact" className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
                        💬 Help & Support
                    </Link>
                </div>
                <p className="text-[11px] text-zinc-600">
                    TamilRing © 2025 • User Generated Content
                </p>
            </div>
        </footer>
    );
}
