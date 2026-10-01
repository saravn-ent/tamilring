
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Manually parse .env.local if dotenv fails for some reason
const envFile = fs.readFileSync(".env.local", "utf8");
const envVars: any = {};
envFile.split("\n").forEach(line => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
    }
});

async function testAI() {
    const apiKey = envVars.GOOGLE_AI_API_KEY;
    console.log("Testing with key starting with:", apiKey ? apiKey.substring(0, 7) : "MISSING");

    if (!apiKey) {
        console.error("GOOGLE_AI_API_KEY not found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-1.5-flash", "gemini-pro"];

    for (const modelName of models) {
        try {
            console.log(`Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`SUCCESS with ${modelName}:`, response.text());
            return;
        } catch (error: any) {
            console.error(`FAILED with ${modelName}:`, error.message);
        }
    }
}

testAI();
