'use client';

import { useEffect, useRef, useState } from 'react';

interface ParseRequest {
    id: string;
    title: string;
    songName?: string;
    movieName?: string;
}

interface ParseResponse {
    id: string;
    displayName: string;
}

// Singleton worker instance (shared across all components)
let workerInstance: Worker | null = null;
const pendingRequests = new Map<string, (result: string) => void>();

function getWorker(): Worker {
    if (!workerInstance && typeof window !== 'undefined') {
        workerInstance = new Worker(new URL('../workers/titleParser.worker.ts', import.meta.url));

        workerInstance.onmessage = (e: MessageEvent<ParseResponse>) => {
            const { id, displayName } = e.data;
            const resolver = pendingRequests.get(id);
            if (resolver) {
                resolver(displayName);
                pendingRequests.delete(id);
            }
        };
    }
    return workerInstance!;
}

/**
 * Hook to parse ringtone titles using Web Worker (background thread)
 * Zero main thread blocking - Facebook-style performance
 */
export function useTitleParser(
    title: string,
    songName?: string,
    movieName?: string
): string {
    const [displayName, setDisplayName] = useState(title); // Fallback to original title
    const requestIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (typeof window === 'undefined') {
            // SSR fallback
            setDisplayName(title);
            return;
        }

        const worker = getWorker();
        const requestId = `${title}-${Date.now()}-${Math.random()}`;
        requestIdRef.current = requestId;

        // Register callback
        pendingRequests.set(requestId, (result) => {
            if (requestIdRef.current === requestId) {
                setDisplayName(result);
            }
        });

        // Send to worker
        const request: ParseRequest = {
            id: requestId,
            title,
            songName,
            movieName,
        };
        worker.postMessage(request);

        return () => {
            // Cleanup
            pendingRequests.delete(requestId);
        };
    }, [title, songName, movieName]);

    return displayName;
}

/**
 * Synchronous version with fallback (for SSR compatibility)
 */
export function parseTitleSync(
    title: string,
    songName?: string,
    movieName?: string
): string {
    // Simple fallback for SSR or when worker isn't available
    const song = songName?.trim() || '';
    const movie = movieName?.trim() || '';

    if (song) return song;
    if (movie) return movie;
    return title;
}
