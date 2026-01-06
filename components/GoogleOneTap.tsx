'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, usePathname } from 'next/navigation';
import Script from 'next/script';

export default function GoogleOneTap() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    const initializeOneTap = async () => {
        if (!mounted) return;

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Google One Tap: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in environment variables.');
            }
            return;
        }

        // Check if user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) return;

        const google = (window as any).google;
        if (google) {
            google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: any) => {
                    try {
                        const { error } = await supabase.auth.signInWithIdToken({
                            provider: 'google',
                            token: response.credential,
                        });

                        if (error) throw error;

                        // Use window.location.reload() for a full state sync if needed,
                        // or router.refresh() for a softer update.
                        router.refresh();
                    } catch (error) {
                        console.error('One Tap Login Error:', error);
                    }
                },
                auto_select: false, // Set to false by default for better UX (don't surprise guest users)
                itp_support: true,
                ux_mode: 'popup',
            });

            // Delay the prompt slightly to ensure it doesn't fight other page animations
            setTimeout(() => {
                google.accounts.id.prompt((notification: any) => {
                    if (notification.isNotDisplayed()) {
                        console.log('One Tap not displayed:', notification.getNotDisplayedReason());
                    } else if (notification.isSkippedMoment()) {
                        console.log('One Tap skipped:', notification.getSkippedReason());
                    }
                });
            }, 2000);
        }
    };

    useEffect(() => {
        if (mounted) {
            initializeOneTap();
        }
    }, [mounted, pathname]);

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={initializeOneTap}
        />
    );
}
