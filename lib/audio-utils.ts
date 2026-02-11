/**
 * Audio Utility for Acoustic Fingerprinting
 * Generates a stable signature based on audio content characteristics
 */

export async function generateAcousticFingerprint(file: File): Promise<string> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    // We'll take 10 points throughout the audio
    const numPoints = 10;
    const fingerprints: string[] = [];

    for (let i = 0; i < numPoints; i++) {
        const time = (duration / (numPoints + 1)) * (i + 1);
        const startSample = Math.floor(time * sampleRate);
        const windowSize = 2048; // Look at a small window

        if (startSample + windowSize > channelData.length) break;

        // Calculate RMS (Energy) of this window
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
            sum += channelData[startSample + j] * channelData[startSample + j];
        }
        const rms = Math.sqrt(sum / windowSize);

        // Very simple "spectral" check - count zero crossings in this window
        let zeroCrossings = 0;
        for (let j = 1; j < windowSize; j++) {
            if ((channelData[startSample + j] >= 0 && channelData[startSample + j - 1] < 0) ||
                (channelData[startSample + j] < 0 && channelData[startSample + j - 1] >= 0)) {
                zeroCrossings++;
            }
        }

        // Store energy and crossing density
        // We quantize these values to make them slightly resilient to gain/bitrate changes
        const energyLevel = Math.round(rms * 100);
        const crossingLevel = Math.round(zeroCrossings / 20); // Quantized

        fingerprints.push(`${energyLevel}:${crossingLevel}`);
    }

    await audioContext.close();
    return fingerprints.join('|');
}
