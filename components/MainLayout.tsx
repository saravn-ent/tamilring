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
        <main 
            className="min-h-screen relative z-0 pb-4 md:pb-8"
            style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top))' }}
        >
            <PullToRefresh>
                {children}
            </PullToRefresh>
        </main>
    );
}
