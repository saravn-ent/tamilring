
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const targetLang = formData.get('targetLang') as string || 'ta';
        const apiKey = process.env.GOOGLE_AI_API_KEY;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({
                error: 'API Key missing',
                mock: true,
                text: "This is a mock transcription because GOOGLE_AI_API_KEY is not set."
            }, { status: 200 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Convert file to base64
        console.log('Transcription request:', { type: file.type, size: file.size, targetLang });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = buffer.toString('base64');

        // Gemini strictly supports: audio/wav, audio/mp3, audio/aiff, audio/aac, audio/ogg, audio/flac
        // If it's audio/webm (Chromium default), Gemini 1.5 might handle it, but audio/ogg is safer for Opus
        let mimeType = file.type.split(';')[0] || 'audio/webm';
        if (mimeType.includes('webm')) {
            mimeType = 'audio/webm'; // Keep it simple, or map to audio/ogg if it fails
        }

        const prompt = `
            Transcribe the following audio precisely. 
            The user is providing a "Name Ringtone" message.
            They might be speaking in mixed languages like Tanglish (Tamil+English), Hinglish (Hindi+English), etc.
            
            Target Language context: ${targetLang}
            
            Instructions:
            1. Transcribe exactly what is said.
            2. If it is a mixed language (e.g., Tanglish), provide the transcription in the target language script (${targetLang}) for the native parts and maintain English for technical/English words if it makes more sense, OR convert the whole thing to the native script if that's what the user intended for a ringtone.
            3. For ringtones, "Raja phone edu" should ideally be "ராஜா போன் எடு".
            4. Return ONLY the transcribed text. Do not include any explanations or other text.
        `;

        const result = await model.generateContent([
            { text: prompt },
            {
                inlineData: {
                    data: base64Audio,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const transcribedText = response.text().trim();
        console.log('Transcription successful');

        return NextResponse.json({ text: transcribedText });

    } catch (error: any) {
        console.error('Gemini Transcription Error:', error);

        let errorMessage = 'Transcription failed';
        let statusCode = 500;

        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
            errorMessage = 'Voice AI is busy (Rate limit). Please wait a few seconds and try again.';
            statusCode = 429;
        } else if (error.message?.includes('404')) {
            errorMessage = 'Speech model config error. Please contact support.';
            statusCode = 404;
        } else if (error.message?.includes('quota')) {
            errorMessage = 'API Quota exceeded for today.';
            statusCode = 429;
        }

        return NextResponse.json({
            error: errorMessage,
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: statusCode });
    }
}
