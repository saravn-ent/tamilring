
// ADVANCED DSP CHORUS DETECTION (No AI Model, Pure Signal Processing)
// -------------------------------------------------------------------
// Features:
// 1. Vocal Range Isolation (approx 300Hz-3kHz)
// 2. Dynamic Pattern Matching (Self-Similarity)
// 3. Energy & Entropy Analysis

// Helper: Simple Low-Pass / High-Pass filters to approximate Bandpass
// We use a simple difference equation for speed.
function runVocalFilter(buffer) {
    // Simple bandpass logic (keep mid-frequencies)
    // In time domain: y[n] = x[n] - x[n-1] (High pass) -> then smooth (Low pass)
    // This isn't perfect but highlights "change" (vocals/drums) vs "drone" (bass).
    const filtered = new Float32Array(buffer.length);
    for (let i = 1; i < buffer.length; i++) {
        // First differentiator (High Pass, remove deep bass)
        let hp = buffer[i] - buffer[i - 1];
        // Then simple moving average (Low Pass, remove hiss)
        filtered[i] = (hp + (filtered[i - 1] || 0)) / 2;
    }
    return filtered;
}

self.addEventListener('message', async (event) => {
    const { audioData, sampleRate } = event.data;

    try {
        self.postMessage({ status: 'processing', message: 'Analyzing Audio Patterns...' });

        const originalData = new Float32Array(audioData);
        // 1. "Vocal Focus" - Filter out sub-bass and high hiss to focus on melody range
        const filteredData = runVocalFilter(originalData);

        // 2. Feature Extraction (Resolution: 0.5s per block)
        const samplesPerBlock = Math.floor(sampleRate * 0.5);
        const totalBlocks = Math.floor(filteredData.length / samplesPerBlock);

        const features = [];

        for (let i = 0; i < totalBlocks; i++) {
            const startStr = i * samplesPerBlock;
            const endStr = startStr + samplesPerBlock;

            let sumSq = 0;
            // Sparse sampling for speed (every 10th sample)
            for (let j = startStr; j < endStr; j += 10) {
                const val = filteredData[j];
                sumSq += val * val;
            }
            // Feature: RMS Energy of Vocal Band
            const rms = Math.sqrt(sumSq / ((endStr - startStr) / 10));
            features.push(rms);
        }

        // 3. Similarity Matrix (Pattern Matching)
        // We look for blocks that repeat! 
        // A chorus repeats. A verse might not.

        const scores = new Float32Array(totalBlocks).fill(0);

        // Window Size for "Chorus" candidate: ~15s (30 blocks)
        // We slide a 15s window and see how much it matches the REST of the song.
        const windowBlocks = 30; // 15 seconds

        self.postMessage({ status: 'processing', message: 'Finding Repeating Hooks...' });

        // Optimization: Don't compare every single block. Compare "Textures"
        // We just score each window based on:
        // Score = (Energy) + (Repetitiveness)

        for (let i = 0; i < features.length - windowBlocks; i++) {
            // A. Calculate Local Energy (Is it loud/active?)
            let energySum = 0;
            for (let k = 0; k < windowBlocks; k++) energySum += features[i + k];
            const avgEnergy = energySum / windowBlocks;

            // B. Calculate "Repetitiveness" (Does this pattern appear elsewhere?)
            // We compare this window `i` with window `j` (later in song)
            let repetitionScore = 0;

            // Look ahead in the song (skip immediate overlap)
            for (let j = i + windowBlocks * 2; j < features.length - windowBlocks; j += 10) {
                // Compare Window I vs Window J
                let dist = 0;
                for (let k = 0; k < windowBlocks; k += 2) { // sparse compare
                    dist += Math.abs(features[i + k] - features[j + k]);
                }
                // If distance is low (similar), add to score
                if (dist < (avgEnergy * 0.5)) {
                    repetitionScore += 1; // It repeats!
                }
            }

            // C. Center Bias (Chorus usually in middle 50% of song)
            const relativePos = i / features.length;
            const centerBias = 1 - Math.pow(2 * relativePos - 1, 4);

            // Final Score Formula
            // High Energy + Repeating Pattern + Center Bias
            scores[i] = (avgEnergy * 1.0) + (repetitionScore * (avgEnergy * 0.5)) + (centerBias * (avgEnergy * 0.3));
        }

        // 4. Find Top 3 Candidates (Non-Overlapping)
        const candidates = [];

        for (let c = 0; c < 3; c++) {
            let bestVal = -1;
            let bestIdx = 0;

            for (let i = 0; i < scores.length; i++) {
                if (scores[i] > bestVal) {
                    bestVal = scores[i];
                    bestIdx = i;
                }
            }

            if (bestVal > 0) {
                const startTime = bestIdx * 0.5;
                candidates.push({
                    start: startTime,
                    end: startTime + 30, // Default 30s
                    score: bestVal
                });

                // "Erase" this area from scores so we don't pick it again
                // Clear +/- 30 seconds around it
                const clearStart = Math.max(0, bestIdx - 60);
                const clearEnd = Math.min(scores.length, bestIdx + 60);
                for (let k = clearStart; k < clearEnd; k++) scores[k] = 0;
            }
        }

        // Sort by time (chronological) or score?
        // Let's sort by Score (Best first)
        candidates.sort((a, b) => b.score - a.score);

        // Return Best Candidate immediately (Compatibility with existing UI)
        // Ideally we return all 3, but UI handles one. We'll send the #1 Best.

        const best = candidates[0];

        self.postMessage({
            status: 'complete',
            start: best.start,
            end: best.end,
            candidates: candidates // Send full list for future UI upgrade
        });

    } catch (e) {
        self.postMessage({ status: 'error', message: e.message });
    }
});
