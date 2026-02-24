
const fs = require('fs');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

// Load env vars from .env.local if not in process.env
if (fs.existsSync('.env.local')) {
  const envConfig = fs.readFileSync('.env.local', 'utf8');
  envConfig.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key]) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const SERVICE_ACCOUNT_FILE = './service_account.json';
const SITE_URL = 'https://tamilring.in';
const PROGRESS_FILE = './scripts/indexing-progress.json';

// Load or initialize progress
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return {
    submittedUrls: [],
    lastRunDate: null,
    totalSubmitted: 0,
    totalFailed: 0,
    completedBatches: 0
  };
}

// Save progress
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function main() {
  console.log('🚀 Google Indexing Script - Smart Resume Mode\n');

  const hasCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || fs.existsSync(SERVICE_ACCOUNT_FILE);
  
  if (!hasCredentials) {
    console.error('❌ Error: No Google Indexing credentials found.');
    console.error('Please either:');
    console.error('1. Save your Service Account JSON key as "service_account.json" in root.');
    console.error('2. Set the GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable.');
    return;
  }

  // Load progress
  const progress = loadProgress();
  console.log(`📊 Progress Summary:`);
  console.log(`   - Total submitted so far: ${progress.totalSubmitted}`);
  console.log(`   - Total failed: ${progress.totalFailed}`);
  console.log(`   - Last run: ${progress.lastRunDate || 'Never'}`);
  console.log(`   - Completed batches: ${progress.completedBatches}\n`);

  // 1. Init Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials missing.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 2. Init Google Auth
  let authConfig = {
    scopes: ['https://www.googleapis.com/auth/indexing'],
  };

  if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
    authConfig.credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
  } else {
    authConfig.keyFile = SERVICE_ACCOUNT_FILE;
  }

  const auth = new google.auth.GoogleAuth(authConfig);
  const indexing = google.indexing({ version: 'v3', auth });

  console.log('🔍 Fetching all ringtones from Supabase...');
  
  // Fetch all approved ringtones
  const { data: ringtones, error } = await supabase
    .from('ringtones')
    .select('slug')
    .eq('status', 'approved');

  if (error) {
    console.error('❌ Supabase Error:', error);
    return;
  }

  console.log(`✅ Found ${ringtones.length} total ringtones.\n`);

  // 3. Filter out already submitted URLs
  const allUrls = ringtones.map(r => `${SITE_URL}/ringtone/${r.slug}`);
  const submittedSet = new Set(progress.submittedUrls);
  const pendingUrls = allUrls.filter(url => !submittedSet.has(url));

  console.log(`📋 Status:`);
  console.log(`   - Already submitted: ${progress.submittedUrls.length}`);
  console.log(`   - Pending: ${pendingUrls.length}`);
  console.log(`   - Total: ${allUrls.length}\n`);

  if (pendingUrls.length === 0) {
    console.log('🎉 All URLs have been submitted! Nothing to do.');
    return;
  }

  console.log(`🚀 Starting submission of ${pendingUrls.length} URLs...\n`);

  let successCount = 0;
  let failCount = 0;
  let quotaExceeded = false;

  for (let i = 0; i < pendingUrls.length; i++) {
    const url = pendingUrls[i];
    
    try {
      // Show progress every 10 URLs
      if (i % 10 === 0) {
        console.log(`📍 Progress: ${i}/${pendingUrls.length} (${Math.round(i/pendingUrls.length*100)}%)`);
      }
      
      const result = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_UPDATED',
        },
      });
      
      // Mark as submitted
      progress.submittedUrls.push(url);
      progress.totalSubmitted++;
      successCount++;
      
      // Save progress every 10 successful submissions
      if (successCount % 10 === 0) {
        saveProgress(progress);
      }
      
      // Rate limiting - wait 500ms between requests
      await new Promise(r => setTimeout(r, 500)); 
      
    } catch (e) {
      console.error(`\n❌ Failed for URL: ${url}`);
      console.error(`   Error: ${e.message}`);
      
      // Check if quota exceeded
      if (e.code === 429 || e.message.includes('quota') || e.message.includes('Quota')) {
        console.log('\n⚠️  Daily quota exceeded. Saving progress...');
        quotaExceeded = true;
        break;
      }
      
      failCount++;
      progress.totalFailed++;
    }
  }

  // Update final progress
  progress.lastRunDate = new Date().toISOString();
  if (!quotaExceeded) {
    progress.completedBatches++;
  }
  saveProgress(progress);

  // Final Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL REPORT');
  console.log('='.repeat(60));
  console.log(`✅ Successfully submitted this run: ${successCount}`);
  console.log(`❌ Failed this run: ${failCount}`);
  console.log(`📈 Total submitted (all time): ${progress.totalSubmitted}/${allUrls.length}`);
  console.log(`📉 Remaining: ${allUrls.length - progress.totalSubmitted}`);
  console.log(`📅 Last run: ${progress.lastRunDate}`);
  console.log('='.repeat(60));

  if (quotaExceeded) {
    console.log('\n💡 TIP: Run this script again tomorrow to continue!');
    console.log('   Command: node scripts/index-now.js');
  } else if (progress.totalSubmitted >= allUrls.length) {
    console.log('\n🎉 CONGRATULATIONS! All URLs have been submitted to Google!');
    console.log('   Your pages should start appearing in search within 24-48 hours.');
  }
}

main().catch(console.error);
