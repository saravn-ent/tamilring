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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Authentication Error</h1>
            <p className="text-zinc-400 mb-4 max-w-sm">
                {error || 'There was an issue signing you in. The verification code may have expired or is invalid.'}
            </p>
            <p className="text-zinc-600 text-xs mb-8">
                Redirecting to home in {seconds} seconds...
            </p>
            <Link href="/" className="bg-emerald-500 text-black font-bold px-6 py-2 rounded-full hover:bg-emerald-400 transition-colors">
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
