
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-2.0-flash"];

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
