
// Removed unused/heavy transformers import for now to speed up "Smart Engine"
// import { pipeline, env } from '@xenova/transformers';

// Configuration for transformers.js
// env.allowLocalModels = false;
// env.useBrowserCache = true;

// Pre-load logic if needed
// let analysisPipeline: any = null;

/*
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
*/

self.onmessage = async (e: MessageEvent) => {
    const { type, payload } = e.data;
    const id = payload?.id;

    try {
        switch (type) {
            case 'ANALYZE_ENERGY':
                const result = analyzeEnergy(payload.audioData, payload.sampleRate);
                self.postMessage({ type: 'ENERGY_RESULT', data: result, id });
                break;

            case 'PROCESS_AUDIO':
                const { left, right, mode, sampleRate } = payload;
                if (!right) {
                    // Fallback for mono files: cannot do phase cancellation
                    // Just return original
                    self.postMessage({ type: 'PROCESS_RESULT', data: left, id });
                    return;
                }

                let processed: Float32Array;
                if (mode === 'karaoke') {
                    processed = processKaraoke(left, right);
                } else {
                    processed = processVocals(left, right, sampleRate);
                }

                self.postMessage({ type: 'PROCESS_RESULT', data: processed, id });
                break;

            case 'SPLIT_PROTOTYPE':
                // Deprecated in favor of PROCESS_AUDIO, but kept for graceful fallback if needed
                self.postMessage({
                    type: 'SPLIT_RESULT',
                    error: 'Vocal separation requires a specialized model (>100MB). Prototype logic updated.',
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
 * Finds the top candidates for ringtones with DYNAMIC smart lengths.
 * Instead of a fixed 30s, it looks for natural energy drops to define the best start/end points.
 */
function analyzeEnergy(audioData: Float32Array, sampleRate: number) {
    if (!audioData || audioData.length === 0) {
        return { start: 0, end: 0, candidates: [] };
    }

    const rmsWindowSize = Math.floor(sampleRate * 0.5);
    const rmsMap: { time: number, value: number, index: number }[] = [];

    // OPTIMIZATION: Stride-based RMS for fast analysis
    for (let i = 0; i < audioData.length; i += rmsWindowSize) {
        let sum = 0;
        const end = Math.min(i + rmsWindowSize, audioData.length);

        // HPF Pre-emphasis (High-Pass) to focus on perceived loudness (vocals/beats)
        for (let j = i; j < end; j += 4) {
            const current = audioData[j];
            const prev = j > 0 ? audioData[j - 1] : 0;
            const diff = current - prev;
            sum += diff * diff;
        }

        const count = Math.max(1, (end - i) / 4);
        const rms = Math.sqrt(sum / count);
        rmsMap.push({ time: i / sampleRate, value: rms, index: rmsMap.length });
    }

    // 2. Smooth the RMS map (Moving Average)
    let maxVal = 0;
    const smoothedMap = rmsMap.map((item, idx) => {
        let sum = item.value;
        let count = 1;
        for (let k = 1; k <= 2; k++) {
            if (rmsMap[idx - k]) { sum += rmsMap[idx - k].value; count++; }
            if (rmsMap[idx + k]) { sum += rmsMap[idx + k].value; count++; }
        }
        const smoothed = sum / count;
        if (smoothed > maxVal) maxVal = smoothed;
        return { ...item, value: smoothed };
    });

    // OPTIMIZATION 3: Normalization (0.0 - 1.0)
    // Ensures thresholds work consistently regardless of song volume
    smoothedMap.forEach(item => item.value = item.value / (maxVal || 1));

    // 3. Find Peaks using NORMALIZED smoothed map
    const sortedCones = [...smoothedMap].sort((a, b) => b.value - a.value);
    const silenceThreshold = 0.25; // Now this is absolute 25% of max volume

    const candidates: { start: number; end: number }[] = [];
    const maxCandidates = 20;

    // 4. Dynamic Region Expansion
    for (const peak of sortedCones) {
        if (candidates.length >= maxCandidates) break;
        if (peak.value < silenceThreshold) continue; // Skip quiet parts

        // --- Smart Expansion Logic ---
        // Expand Left and Right from the peak until loudness drops significantly
        // This attempts to capture the full "phrase" or "section"

        // Lower threshold to keep detection "holding on" longer during the chorus
        // Was 0.75, now 0.60 (allows 40% drop from peak before cutting)
        const expansionThreshold = peak.value * 0.60;

        let startIdx = peak.index;
        let endIdx = peak.index;

        // Expand Left
        while (startIdx > 0) {
            const prev = smoothedMap[startIdx - 1];
            // Stop if too quiet relative to peak OR is absolute silence
            if (prev.value < expansionThreshold || prev.value < 0.05) break;
            startIdx--;
        }

        // Expand Right
        while (endIdx < smoothedMap.length - 1) {
            const next = smoothedMap[endIdx + 1];
            if (next.value < expansionThreshold || next.value < 0.05) break;
            endIdx++;
        }

        // Convert to seconds
        let start = smoothedMap[startIdx].time;
        let end = smoothedMap[endIdx].time;

        // --- Constraints & Tuning ---
        // Ringtones should generally be 28s - 38s.
        let duration = end - start;

        // Constraint A: Too Short -> Increased minimum to 28s (standard ringtone size)
        // If the detected "loud part" is only 10s, we expand it to 28s centered(ish) on the loud part
        if (duration < 28) {
            const needed = 28 - duration;
            start = Math.max(0, start - needed / 2);
            end = Math.min(audioData.length / sampleRate, end + needed / 2);
            duration = end - start;
        }

        // Constraint B: Too Long -> Cap at 38s
        if (duration > 38) {
            // If it's huge, centering the 35s around the peak is safer than arbitrary cuts
            // But usually for a ringtone, we want the "attack" of the chorus.
            // Let's bias towards the start of the detected high-energy block.
            end = start + 38;
        }

        // --- Overlap Check ---
        // Ensure this new candidate doesn't overlap significantly with existing ones
        const isOverlapping = candidates.some(c => {
            // Check intersection
            const overlapStart = Math.max(start, c.start);
            const overlapEnd = Math.min(end, c.end);
            const overlapDur = Math.max(0, overlapEnd - overlapStart);
            return overlapDur > 5; // Allow max 5s overlap (fades), otherwise reject
        });

        if (!isOverlapping) {
            candidates.push({ start, end });
        }
    }

    // Fallback if nothing passed filters
    if (candidates.length === 0) {
        candidates.push({ start: 0, end: Math.min(30, audioData.length / sampleRate) });
    }

    return {
        start: candidates[0].start,
        end: candidates[0].end,
        candidates: candidates
    };
}

/**
 * AUDIO PROCESSING LOGIC
 */

/**
 * Basic Biquad Filter Implementation (IIR)
 * Source: Audio EQ Cookbook
 */
class BiquadFilter {
    b0 = 0; b1 = 0; b2 = 0; a1 = 0; a2 = 0;
    x1 = 0; x2 = 0; y1 = 0; y2 = 0;

    constructor(type: 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'peaking', sampleRate: number, frequency: number, Q: number, gainDB = 0) {
        this.calcCoefficients(type, sampleRate, frequency, Q, gainDB);
    }

    calcCoefficients(type: string, Fs: number, f0: number, Q: number, gainDB: number) {
        const A = Math.pow(10, gainDB / 40);
        const w0 = 2 * Math.PI * f0 / Fs;
        const alpha = Math.sin(w0) / (2 * Q);
        const cosw0 = Math.cos(w0);

        let a0 = 1;

        if (type === 'bandpass') {
            this.b0 = alpha;
            this.b1 = 0;
            this.b2 = -alpha;
            a0 = 1 + alpha;
            this.a1 = -2 * cosw0;
            this.a2 = 1 - alpha;
        } else if (type === 'notch') {
            this.b0 = 1;
            this.b1 = -2 * cosw0;
            this.b2 = 1;
            a0 = 1 + alpha;
            this.a1 = -2 * cosw0;
            this.a2 = 1 - alpha;
        }

        // Normalize
        this.b0 /= a0;
        this.b1 /= a0;
        this.b2 /= a0;
        this.a1 /= a0;
        this.a2 /= a0;
    }

    process(sample: number): number {
        const y = this.b0 * sample + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
        this.x2 = this.x1;
        this.x1 = sample;
        this.y2 = this.y1;
        this.y1 = y;
        return y;
    }
}

/**
 * Basic Phase Cancellation for Karaoke (Stereo) or BandStop (Mono)
 */
function processKaraoke(left: Float32Array, right: Float32Array | null, sampleRate: number = 44100): Float32Array {
    const output = new Float32Array(left.length);

    // MONO FALLBACK: BandStop (Notch) Filter to remove Vocal Range (approx 300Hz-3000Hz, center 1000Hz)
    if (!right) {
        const filter = new BiquadFilter('notch', sampleRate, 1000, 0.5); // Wide notch at 1kHz
        for (let i = 0; i < left.length; i++) output[i] = filter.process(left[i]);
        return output;
    }

    // STEREO: Phase Cancellation
    for (let i = 0; i < left.length; i++) {
        output[i] = (left[i] - right[i]) * 0.5;
    }
    return output;
}

/**
 * Center Channel Isolation (Stereo) or BandPass (Mono)
 */
function processVocals(left: Float32Array, right: Float32Array | null, sampleRate: number): Float32Array {
    const output = new Float32Array(left.length);

    // MONO FALLBACK: BandPass Filter to isolate Vocal Range
    if (!right) {
        const filter = new BiquadFilter('bandpass', sampleRate, 1000, 0.5); // Wide bandpass at 1kHz
        for (let i = 0; i < left.length; i++) output[i] = filter.process(left[i]);
        return output;
    }

    // STEREO: Center Isolation (Average)
    for (let i = 0; i < left.length; i++) {
        output[i] = (left[i] + right[i]) * 0.5;
    }
    return output;
}
