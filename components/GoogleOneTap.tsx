'use client';

import { useEffect, useState, useRef } from 'react';
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

    const initializationRef = useRef(false);

    const initializeOneTap = async () => {
        if (!mounted || initializationRef.current) return;

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
            // Prevent multiple initializations
            initializationRef.current = true;

            google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: any) => {
                    try {
                        const { error } = await supabase.auth.signInWithIdToken({
                            provider: 'google',
                            token: response.credential,
                        });

                        if (error) throw error;
                        router.refresh();
                    } catch (error) {
                        console.error('One Tap Login Error:', error);
                    }
                },
                auto_select: false,
                itp_support: true,
                ux_mode: 'popup',
            });

            // Use a single prompt call with a slightly longer delay to avoid React strict mode double-invocations
            setTimeout(() => {
                google.accounts.id.prompt((notification: any) => {
                    if (notification.isNotDisplayed()) {
                        console.log('One Tap not displayed:', notification.getNotDisplayedReason());
                        initializationRef.current = false; // Reset on failure so we can try again if user navigates
                    } else if (notification.isSkippedMoment()) {
                        console.log('One Tap skipped:', notification.getSkippedReason());
                        initializationRef.current = false;
                    }
                    // Note: We don't reset on success immediately to prevent re-prompting during redirect
                });
            }, 1000);
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
