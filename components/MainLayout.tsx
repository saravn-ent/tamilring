'use client';

import { usePathname } from 'next/navigation';
import PullToRefresh from './PullToRefresh';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return (
            <main className="min-h-screen relative z-0">
                {children}
            </main>
        );
    }

    return (
        <main className="min-h-screen relative z-0 pt-14 pb-4 md:pb-8">
            <PullToRefresh>
                {children}
            </PullToRefresh>
        </main>
    );
}
