
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

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
    if (!apiKey) return;

    // Test with v1 explicitly if possible
    const genAI = new GoogleGenerativeAI(apiKey);

    // Note: The SDK doesn't easily let you switch to v1 in the constructor without more config
    // but we can try different model strings that might be version-specific
    const models = ["gemini-1.5-flash", "gemini-1.0-pro", "models/gemini-1.5-flash"];

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
