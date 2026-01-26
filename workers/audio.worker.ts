
import { pipeline, env } from '@xenova/transformers';

// Configuration for transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

// Pre-load logic if needed
let analysisPipeline: any = null;

async function getAnalysisPipeline() {
    if (!analysisPipeline) {
        try {
            // We use a general audio classification model or similar for future "segment type" detection
            // For now, simple RMS is faster for "loudest" detection
            // analysisPipeline = await pipeline('audio-classification', 'Xenova/ast-finetuned-audioset-10-10-0.4593');
        } catch (e) {
            console.error('Worker: Failed to load analysis pipeline', e);
        }
    }
    return analysisPipeline;
}

self.onmessage = async (e: MessageEvent) => {
    const { type, payload } = e.data;
    const id = payload?.id;

    try {
        switch (type) {
            case 'ANALYZE_ENERGY':
                const result = analyzeEnergy(payload.audioData, payload.sampleRate);
                self.postMessage({ type: 'ENERGY_RESULT', data: result, id });
                break;

            case 'SPLIT_PROTOTYPE':
                // This is a placeholder for the htdemucs/vocal separation logic
                self.postMessage({
                    type: 'SPLIT_RESULT',
                    error: 'Vocal separation requires a specialized model (>100MB). Prototype loading...',
                    id
                });
                break;

            default:
                break;
        }
    } catch (err: any) {
        self.postMessage({ type: 'ERROR', error: err.message, id });
    }
};

/**
 * Finds the most "energetic" 30-second window in the audio
 */
function analyzeEnergy(audioData: Float32Array, sampleRate: number) {
    const windowSeconds = 30;
    const stepSeconds = 1;
    const windowSize = windowSeconds * sampleRate;
    const stepSize = stepSeconds * sampleRate;

    if (audioData.length < windowSize) {
        return { start: 0, end: audioData.length / sampleRate };
    }

    let maxEnergy = -1;
    let bestStartIdx = 0;

    // We can downsample for faster energy calculation
    const downsampleFactor = 10;

    for (let i = 0; i < audioData.length - windowSize; i += stepSize) {
        let energy = 0;
        // Sample every 10th value for speed
        for (let j = 0; j < windowSize; j += downsampleFactor) {
            const val = audioData[i + j];
            energy += val * val;
        }

        if (energy > maxEnergy) {
            maxEnergy = energy;
            bestStartIdx = i;
        }
    }

    return {
        start: bestStartIdx / sampleRate,
        end: (bestStartIdx + windowSize) / sampleRate,
        confidence: 0.8 // Prototype value
    };
}
