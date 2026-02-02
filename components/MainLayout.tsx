'use client';

import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <main
            className={`min-h-screen relative z-0 ${isAdmin ? '' : 'pt-14 pb-4 md:pb-8'}`}
        >
            {children}
        </main>
    );
}
