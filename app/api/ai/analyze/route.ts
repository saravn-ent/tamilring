
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const apiKey = process.env.GOOGLE_AI_API_KEY;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!apiKey) {
            // MOCK MODE: If no API key, return a smart-looking mock response
            // This allows the UI to be built even if the user hasn't set up the key yet
            console.warn('GEMINI_API_KEY not found. Using Mock AI Response.');
            return NextResponse.json({
                mock: true,
                summary: "Standard audio metadata analysis. High-fidelity spectral data detected.",
                mood: "Detected Rhythm Pattern",
                vocalClarity: 70,
                lyrics: "Lyrics transcription requires a valid Google AI API Key.",
                recommendation: "Use the cutter tool to select the best part for your ringtone."
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = buffer.toString('base64');

        const prompt = `
            Perform a deep neural analysis of this audio file for professional vocal extraction.
            Provide the following technical and musical details:
            1. Auditory Signature: A summary of musical style, quality, and spectral balance.
            2. Atmosphere: Predominant mood and energy level.
            3. Vocal Clarity: High-precision score (0-100) regarding human voice isolation potential.
            4. Song Metadata: Title and Artist if identifiable.
            5. Transcript: Key lyrics or prominent phrases.
            6. Ringtone Optimization: Recommend the best 30-second segment with justification.
            7. Structural Timestamps: Identify start/end of [Intro, Chorus, Outro] in seconds.
            
            Return ONLY a JSON object with these keys: 
            summary, mood, vocalClarity, songInfo, lyrics, recommendation, structure: { intro: [s,e], chorus: [s,e], outro: [s,e] }.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Audio,
                    mimeType: file.type
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        let data;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            data = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
        } catch {
            data = { summary: text.substring(0, 100), recommendation: "Manual extraction recommended." };
        }

        return NextResponse.json(data);

    } catch (error: unknown) {
        console.error('Gemini Analysis Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'AI analysis failed';
        return NextResponse.json({ error: 'AI analysis failed', details: errorMessage }, { status: 500 });
    }
}
