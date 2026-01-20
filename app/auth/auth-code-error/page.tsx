'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function AuthCodeErrorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get('error');
    const [seconds, setSeconds] = useState(5);

    useEffect(() => {
        if (seconds <= 0) {
            router.push('/');
        }
    }, [seconds, router]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((s) => Math.max(0, s - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-white">
            <h1 className="text-2xl font-black text-red-600 mb-2 tracking-tight">Authentication Error</h1>
            <p className="text-zinc-600 mb-4 max-w-sm font-medium">
                {error || 'There was an issue signing you in. The verification code may have expired or is invalid.'}
            </p>
            <p className="text-zinc-400 text-xs mb-8 uppercase tracking-wider font-bold">
                Redirecting to home in {seconds} seconds...
            </p>
            <Link href="/" className="bg-brand-dark text-white font-bold px-8 py-3 rounded-xl hover:bg-neutral-800 transition-all shadow-lg shadow-brand-dark/20 active:scale-95">
                Go Home Now
            </Link>
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-500">Loading...</div>}>
            <AuthCodeErrorContent />
        </Suspense>
    );
}
