const fs = require('fs');
const { google } = require('googleapis');

async function testIndexing() {
    const SERVICE_ACCOUNT_FILE = './service_account.json';
    const TEST_URL = 'https://tamilring.in/ringtone/test-index-automation';

    console.log('🧪 Testing Google Indexing Utility...');

    if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
        console.error('❌ Error: service_account.json not found.');
        return;
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const indexing = google.indexing({ version: 'v3', auth });

        console.log(`🚀 Submitting test URL: ${TEST_URL}`);

        const response = await indexing.urlNotifications.publish({
            requestBody: {
                url: TEST_URL,
                type: 'URL_UPDATED',
            },
        });

        console.log('✅ Successfully reached Google Indexing API!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Indexing Test Failed:');
        console.error(error);
        if (error.code === 403) {
            console.error('   Ensure the service account email is added as an OWNER in Search Console.');
        }
    }
}

testIndexing().catch(console.error);
