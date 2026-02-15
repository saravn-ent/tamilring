
const fs = require('fs');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const API_KEY = '99da326242c557e26f83f79c33d86324';
const SEARCH_ENGINE = 'www.bing.com'; // IndexNow works for Bing, Yandex, etc.
const HOST = 'tamilring.in';
const SITE_URL = `https://${HOST}`;

// Load env vars
if (fs.existsSync('.env.local')) {
  const envConfig = fs.readFileSync('.env.local', 'utf8');
  envConfig.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key]) {
      process.env[key.trim()] = value.trim();
    }
  });
}

async function main() {
  console.log('🚀 Bing/IndexNow Submission Script\n');

  // 1. Init Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials missing.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Fetching approved ringtones from Supabase...');
  
  const { data: ringtones, error } = await supabase
    .from('ringtones')
    .select('slug')
    .eq('status', 'approved');

  if (error) {
    console.error('❌ Supabase Error:', error);
    return;
  }

  // Combine static pages and dynamic ringtone URLs
  const staticUrls = [
    `${SITE_URL}/`,
    `${SITE_URL}/recent`,
    `${SITE_URL}/categories`,
  ];
  
  const ringtoneUrls = ringtones.map(r => `${SITE_URL}/ringtone/${r.slug}`);
  const allUrls = [...staticUrls, ...ringtoneUrls];

  console.log(`✅ Found ${allUrls.length} total URLs to submit.\n`);

  // IndexNow allows batch submission
  // Limit is 10,000 URLs per request
  const requestBody = JSON.stringify({
    host: HOST,
    key: API_KEY,
    keyLocation: `${SITE_URL}/${API_KEY}.txt`,
    urlList: allUrls
  });

  const options = {
    hostname: SEARCH_ENGINE,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': requestBody.length
    }
  };

  console.log(`📤 Submitting to ${SEARCH_ENGINE}...`);

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✨ SUCCESS! Bing has accepted the submission.');
        console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      } else {
        console.error(`❌ FAILED. Status: ${res.statusCode} ${res.statusMessage}`);
        console.error('   Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request Error: ${e.message}`);
  });

  req.write(requestBody);
  req.end();
}

main().catch(console.error);
