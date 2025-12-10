'use client';

import { useEffect } from 'react';

export default function ReloadOnUpdate() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Reload the page when the service worker controller changes
            // This happens when a new service worker takes over (skipWaiting: true)
            const handler = () => {
                console.log('New version found. Reloading...');
                window.location.reload();
            };

            navigator.serviceWorker.addEventListener('controllerchange', handler);

            return () => {
                navigator.serviceWorker.removeEventListener('controllerchange', handler);
            };
        }
    }, []);

    return null;
}
