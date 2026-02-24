import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

/**
 * Utility to submit a URL to the Google Indexing API for instant crawling.
 * Mostly used for job postings and broadcast events, but works for websites
 * that need rapid indexing of newly created high-value content.
 * 
 * Requirements:
 * 1. service_account.json in the project root.
 * 2. Service Account email added as "Owner" in Google Search Console.
 * 3. Web Search Indexing API enabled in Google Cloud Console.
 */
export async function indexUrl(url: string) {
    const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), 'service_account.json');

    let auth;

    if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
            auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/indexing'],
            });
        } catch {
            console.error('❌ Google Indexing: Failed to parse credentials from ENV');
            return { success: false, error: 'Invalid credentials in env' };
        }
    } else if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
        auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });
    } else {
        console.warn('⚠️ Google Indexing: No credentials found (ENV or file). Skipping indexing.');
        return { success: false, error: 'Credentials missing' };
    }
    try {
        const indexing = google.indexing({ version: 'v3', auth });

        console.log(`🚀 Google Indexing: Submitting ${url}...`);

        const response = await indexing.urlNotifications.publish({
            requestBody: {
                url: url,
                type: 'URL_UPDATED',
            },
        });

        console.log(`✅ Google Indexing: Successfully submitted ${url}`);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Google Indexing Failed for ${url}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
}
