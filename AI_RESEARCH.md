# AI Implementation Strategy

To keep **TamilRing** ahead of the curve, here is the technical roadmap for implementing AI features without high server costs.

## 1. Vocal Remover / Stem Splitter
**Goal:** Separate Vocals and BGM.

### Option A: Server-Side (High Quality, Costly)
-   **Tool:** `Demucs` (Facebook Research) or `Spleeter` (Deezer).
-   **Infrastructure:** Requires GPU Worker (AWS G4 or Replicate API).
-   **Cost:** ~$0.02 - $0.10 per split.
-   **Pros:** Perfect quality.
-   **Cons:** Expensive for specific ringtone use case.

### Option B: Client-Side (Free, Good Enough) **(Recommended)**
-   **Tool:** `Transformers.js` + `ONNX Runtime Web`.
-   **Model:** `htdemucs` (Quantized).
-   **Mechanism:**
    1.  User loads file.
    2.  Browser downloads ~40MB model (cached).
    3.  WebAssembly/WebGPU processes the audio locally.
-   **Pros:** Zero server cost. Limitless usage.
-   **Cons:** Slower on old phones. High battery usage.

**Decision:** We will prototype **Option B** using `Transformers.js`.

## 2. AI Smart Crop
**Goal:** Automatically find the "Chorus" or "Drop" in a song.

### Algorithm
1.  **Energy Detection:** Analyze RMS amplitude to find the loudest 30s.
2.  **Spectral Flux:** Detect onset of major instruments (avoiding long intros).
3.  **Refinement:** Use a lightweight classification model to identify "hook" sections.

### Implementation
-   **Library:** `meyda.js` (Audio Feature Extraction).
-   **Flow:**
    1.  Analyze waveform on load.
    2.  Highlight the "Hotspot" region automatically.
    3.  User can adjust or confirm.

## Next Steps
1.  Install `transformers.js`.
2.  Create `workers/audio.worker.ts` to handle AI processing off-main-thread.
3.  Integrate into `AudioTrimmerV2.tsx`.
