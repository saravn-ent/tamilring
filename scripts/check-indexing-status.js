const fs = require('fs');

const PROGRESS_FILE = './scripts/indexing-progress.json';

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return null;
}

const progress = loadProgress();

if (!progress) {
  console.log('❌ No progress file found. Run the indexing script first.');
  console.log('   Command: node scripts/index-now.js');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('📊 GOOGLE INDEXING STATUS');
console.log('='.repeat(60));
console.log(`✅ Total URLs submitted: ${progress.totalSubmitted}`);
console.log(`❌ Total failed: ${progress.totalFailed}`);
console.log(`📅 Last run: ${progress.lastRunDate ? new Date(progress.lastRunDate).toLocaleString() : 'Never'}`);
console.log(`🔄 Completed batches: ${progress.completedBatches}`);
console.log('='.repeat(60));

if (progress.submittedUrls.length > 0) {
  console.log('\n📋 Sample of submitted URLs (first 5):');
  progress.submittedUrls.slice(0, 5).forEach((url, i) => {
    console.log(`   ${i + 1}. ${url}`);
  });
  if (progress.submittedUrls.length > 5) {
    console.log(`   ... and ${progress.submittedUrls.length - 5} more`);
  }
}

console.log('\n💡 To continue indexing, run: node scripts/index-now.js\n');
