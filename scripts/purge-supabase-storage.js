const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeBucket(bucketName) {
    console.log(`🧹 Scanning bucket: ${bucketName}...`);
    let totalDeleted = 0;

    while (true) {
        const { data: files, error: listError } = await supabase
            .storage
            .from(bucketName)
            .list('', { limit: 100 });

        if (listError) {
            console.error(`❌ Error listing files in ${bucketName}:`, listError.message);
            break;
        }

        if (!files || files.length === 0) {
            console.log(`✅ No more files found in ${bucketName}.`);
            break;
        }

        // Handle folders vs files
        const fileNames = [];
        for (const item of files) {
            if (item.id === null) {
                // Folder - list subfolder
                const { data: subFiles } = await supabase.storage.from(bucketName).list(item.name, { limit: 100 });
                if (subFiles) {
                    fileNames.push(...subFiles.map(sf => `${item.name}/${sf.name}`));
                }
            } else {
                fileNames.push(item.name);
            }
        }

        if (fileNames.length === 0) break;

        console.log(`🗑️ Deleting ${fileNames.length} files...`);
        const { error: deleteError } = await supabase
            .storage
            .from(bucketName)
            .remove(fileNames);

        if (deleteError) {
            console.error('❌ Error deleting files:', deleteError.message);
            break;
        }

        totalDeleted += fileNames.length;
        console.log(`   Deleted ${totalDeleted} files so far...`);
    }

    console.log(`🎉 Finished purging ${bucketName}. Total deleted: ${totalDeleted}`);
}

async function main() {
    console.log('⚠️ WARNING: This will delete all files inside the Supabase "ringtone-files" bucket to reset storage quota to 0 MB.');
    console.log('Ensure Cloudflare R2 migration is complete before running this.\n');
    await purgeBucket('ringtone-files');
}

main().catch(console.error);
