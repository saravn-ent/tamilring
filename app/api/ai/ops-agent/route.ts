
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// DO NOT initialize genAI here, do it inside the handler to ensure env vars are loaded

const SYSTEM_PROMPT = `
You are the "TamilRing Ops Master", a high-level Strategic AI Advisor for TamilRing.in. 
Your domain is a Pan-Indian Audio Utility Platform.

YOUR GOAL:
Analyze the provided context and return a JSON object containing your analysis and a list of specific, executable actions.

OUTPUT FORMAT (STRICT JSON RESPONSE ONLY):
{
  "analysis": "Your professional executive summary of the situation (2-3 paragraphs). Use markdown for formatting.",
  "actions": [
    {
      "type": "DELETE_RINGTONE" | "FLAG_SPAM" | "UPDATE_TAGS" | "FEATURE_RINGTONE",
      "target_id": "UUID of the ringtone (if applicable)",
      "payload": { "reason": "...", "tags": ["..."], "feature_slot": "trending" },
      "description": "Human readable description of what this action does"
    }
  ]
}

YOUR PILLARS:
1. MODERATION: Audit content. If you see spam titles (e.g. "vxv", "test") or bad metadata, create a DELETE_RINGTONE action.
2. LEGAL: Monitor risk. If you see "Sony Music" or strictly copyrighted labels, create a FLAG_SPAM action.
3. BIZDEV / STRATEGY: Suggest trends. If you find a potential viral hit, create a FEATURE_RINGTONE action.

CONSTRAINTS:
- Be professional, data-driven, and authoritative.
- DO NOT wrap the output in \`\`\`json markdown blocks. Just return the raw JSON string.
- Ensure valid JSON.
`;

const CLEAN_JSON_PROMPT = `
IMPORTANT: You MUST return strictly valid raw JSON. 
Do not include any markdown formatting like \`\`\`json or \`\`\`. 
Do not include any text before or after the JSON object.
`;

export async function POST(req: Request) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    console.log("AI Ops Agent: POST request received. Key present:", !!apiKey);

    if (!apiKey) {
        return NextResponse.json({ error: "GOOGLE_AI_API_KEY is missing in environment" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { task, context } = body;

        console.log("AI Ops Agent Task:", task);

        let contextText = "";
        if (context) {
            contextText = `
            STATE:
            Total: ${context.totalRingtones || 'Unknown'}
            Pending: ${context.pendingRingtones || 0}
            Recent: ${JSON.stringify(context.recentUploads || [])}
            `;
        }

        const prompt = `${SYSTEM_PROMPT}\n\nTASK: ${task}\n\nCONTEXT: ${contextText}\n\nResponse:`;

        const genAI = new GoogleGenerativeAI(apiKey);

        // Try flash first as it is most likely to be available on all projects
        // Try lightweight models first, moving to heavier reasoning models
        // Updated for available models (Gemini 2.x series)
        const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-pro"];
        let lastError = null;

        for (const modelName of models) {
            try {
                console.log(`AI Ops Agent: Trying ${modelName}...`);

                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: { responseMimeType: "application/json" }
                });

                // Add a small delay if we are retrying after a previous failure
                if (lastError) await new Promise(r => setTimeout(r, 1000));

                const fullPrompt = `${SYSTEM_PROMPT}\n${CLEAN_JSON_PROMPT}\n\nTASK: ${task}\n\nCONTEXT: ${contextText}\n\nStrict JSON Response:`;
                const result = await model.generateContent(fullPrompt);
                const response = await result.response;
                const text = response.text();

                if (!text) throw new Error("Empty response from AI");

                console.log(`AI Ops Agent: Success with ${modelName}`);
                return NextResponse.json({ text });
            } catch (err: any) {
                console.warn(`AI Ops Agent: ${modelName} failed:`, err.message);

                // If 429 (Resource Exhausted), wait a bit longer before next model
                if (err.message?.includes('429') || err.status === 429) {
                    console.log("AI Ops Agent: Rate limit hit, waiting 2s...");
                    await new Promise(r => setTimeout(r, 2000));
                }

                lastError = err;
            }
        }

        // If all models failed, return specific error
        throw lastError || new Error("All AI models failed to respond");

    } catch (error: any) {
        console.error("AI Ops Agent Final Error:", error);

        return NextResponse.json({
            error: "Agent Brain Offline",
            details: error.message,
            code: error.status || 500
        }, { status: 500 });
    }
}
