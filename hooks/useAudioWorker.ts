'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Singleton worker instance (shared across all components)
let audioWorkerInstance: Worker | null = null;
const activeRequests = new Map<string, { resolve: (data: any) => void; reject: (err: any) => void }>();

function getAudioWorker(): Worker | null {
    if (!audioWorkerInstance && typeof window !== 'undefined') {
        try {
            audioWorkerInstance = new Worker(new URL('../workers/audio.worker.ts', import.meta.url));

            audioWorkerInstance.onmessage = (e: MessageEvent) => {
                const { type, data, error, id } = e.data;
                const correlationId = id || type;
                const request = activeRequests.get(correlationId);

                if (request) {
                    if (error && type !== 'SPLIT_RESULT') { // SPLIT_RESULT currently returns an 'error' by default as a prototype info
                        request.reject(new Error(error));
                    } else {
                        request.resolve(data || { error }); // Return data or the prototype error message
                    }
                    activeRequests.delete(correlationId);
                }
            };

            audioWorkerInstance.onerror = (err) => {
                console.error('Audio Worker Error:', err);
            };
        } catch (err) {
            console.error('Failed to initialize Audio Worker:', err);
        }
    }
    return audioWorkerInstance;
}

/**
 * Hook to interface with the background Audio Processing Worker.
 * Handles AI analysis, energy detection, and future vocal splitting.
 */
export function useAudioWorker() {
    const [isWorkerLoading, setIsWorkerLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const runAnalysis = useCallback(async (audioData: Float32Array, sampleRate: number): Promise<{ start: number, end: number } | null> => {
        const worker = getAudioWorker();
        if (!worker) return null;

        setIsProcessing(true);
        const id = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        return new Promise((resolve, reject) => {
            activeRequests.set(id, { resolve, reject });
            worker.postMessage({
                type: 'ANALYZE_ENERGY',
                payload: { audioData, sampleRate, id }
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (activeRequests.has(id)) {
                    activeRequests.delete(id);
                    reject(new Error('Analysis timed out'));
                }
            }, 10000);
        }).finally(() => setIsProcessing(false)) as Promise<{ start: number, end: number }>;
    }, []);

    const splitVocals = useCallback(async (audioData: Float32Array): Promise<any> => {
        const worker = getAudioWorker();
        if (!worker) return null;

        setIsProcessing(true);
        const id = `split-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        return new Promise((resolve, reject) => {
            activeRequests.set(id, { resolve, reject });
            worker.postMessage({
                type: 'SPLIT_PROTOTYPE',
                payload: { audioData, id }
            });

            // Shorter timeout as it's a prototype
            setTimeout(() => {
                if (activeRequests.has(id)) {
                    activeRequests.delete(id);
                    reject(new Error('Split request timed out'));
                }
            }, 5000);
        }).finally(() => setIsProcessing(false));
    }, []);

    return { runAnalysis, splitVocals, isProcessing };
}
