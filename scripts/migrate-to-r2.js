const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    }
});

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'tamilring-media';
const R2_BASE_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-7adb3d7983ad4219ac5d433a25c74aac.r2.dev').replace(/\/$/, '');

function extractKeyFromSupabaseUrl(url) {
    if (!url) return null;
    const parts = url.split('/ringtone-files/');
    if (parts.length > 1) {
        return `ringtone-files/${parts[1]}`;
    }
    return null;
}

async function uploadBufferToR2(key, buffer, contentType) {
    await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
    }));
    return `${R2_BASE_URL}/${key}`;
}

async function downloadUrl(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            return { ok: false, status: res.status, statusText: res.statusText };
        }
        const arrayBuf = await res.arrayBuffer();
        return {
            ok: true,
            buffer: Buffer.from(arrayBuf),
            contentType: res.headers.get('content-type') || 'audio/mpeg'
        };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

async function main() {
    console.log('🚀 Starting Cloudflare R2 Migration for TamilRing...');
    console.log(`📁 Target Bucket: ${R2_BUCKET}`);
    console.log(`🌐 Public CDN URL: ${R2_BASE_URL}\n`);

    // 1. Fetch ringtones list
    let ringtones = [];
    console.log('🔍 Checking Supabase database...');
    const { data: dbData, error: dbError } = await supabase
        .from('ringtones')
        .select('id, title, audio_url, audio_url_iphone, poster_url');

    if (dbError) {
        console.warn('⚠️ Could not fetch from Supabase API (may be 402 locked):', dbError.message);
        const backupFile = path.resolve(__dirname, '../scratch/all_ringtones_backup_before_delete.json');
        if (fs.existsSync(backupFile)) {
            console.log('📦 Loading ringtones from local backup file...');
            ringtones = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
            console.log(`✅ Loaded ${ringtones.length} ringtones from backup.`);
        } else {
            console.error('❌ No backup file found and Supabase is locked. Exiting.');
            process.exit(1);
        }
    } else {
        ringtones = dbData || [];
        console.log(`✅ Fetched ${ringtones.length} ringtones directly from Supabase DB.`);
    }

    // 2. Filter tracks needing migration
    const pendingMigration = ringtones.filter(r => 
        (r.audio_url && r.audio_url.includes('.supabase.co/storage')) ||
        (r.audio_url_iphone && r.audio_url_iphone.includes('.supabase.co/storage')) ||
        (r.poster_url && r.poster_url.includes('.supabase.co/storage'))
    );

    console.log(`\n📊 Total items needing migration from Supabase Storage: ${pendingMigration.length}`);

    if (pendingMigration.length === 0) {
        console.log('✨ All media files are already migrated or hosted externally!');
        return;
    }

    // 3. Test first download to verify Supabase storage access
    const firstTrack = pendingMigration[0];
    console.log(`🧪 Testing file access with: ${firstTrack.title}`);
    const testResult = await downloadUrl(firstTrack.audio_url);

    if (!testResult.ok) {
        console.error('\n❌ ERROR: Cannot download audio file from Supabase.');
        console.error(`Status: ${testResult.status} ${testResult.statusText || ''} (${testResult.error || ''})`);
        if (testResult.status === 402) {
            console.error('\n🔴 Supabase HTTP 402 Lock is still active.');
            console.error('👉 Action Required: Open Supabase Dashboard > Billing and click "Change spend cap" or upgrade plan to lift the 402 block.');
            console.error('Once unlocked, run this script again: node scripts/migrate-to-r2.js\n');
        }
        process.exit(1);
    }

    console.log('✅ File download successful! Proceeding with migration...\n');

    let migratedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < pendingMigration.length; i++) {
        const item = pendingMigration[i];
        process.stdout.write(`[${i + 1}/${pendingMigration.length}] Migrating "${item.title || item.id}"... `);

        const updates = {};

        // Migrate audio_url
        if (item.audio_url && item.audio_url.includes('.supabase.co/storage')) {
            const key = extractKeyFromSupabaseUrl(item.audio_url);
            if (key) {
                const dl = await downloadUrl(item.audio_url);
                if (dl.ok) {
                    const newUrl = await uploadBufferToR2(key, dl.buffer, dl.contentType);
                    updates.audio_url = newUrl;
                } else {
                    console.warn(`(Failed audio dl: ${dl.status || dl.error}) `);
                }
            }
        }

        // Migrate audio_url_iphone
        if (item.audio_url_iphone && item.audio_url_iphone.includes('.supabase.co/storage')) {
            const key = extractKeyFromSupabaseUrl(item.audio_url_iphone);
            if (key) {
                const dl = await downloadUrl(item.audio_url_iphone);
                if (dl.ok) {
                    const newUrl = await uploadBufferToR2(key, dl.buffer, 'audio/x-m4r');
                    updates.audio_url_iphone = newUrl;
                }
            }
        }

        // Migrate poster_url if in Supabase storage
        if (item.poster_url && item.poster_url.includes('.supabase.co/storage')) {
            const key = extractKeyFromSupabaseUrl(item.poster_url);
            if (key) {
                const dl = await downloadUrl(item.poster_url);
                if (dl.ok) {
                    const newUrl = await uploadBufferToR2(key, dl.buffer, dl.contentType);
                    updates.poster_url = newUrl;
                }
            }
        }

        // Update in database if updates exist
        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('ringtones')
                .update(updates)
                .eq('id', item.id);

            if (updateError) {
                console.log(`❌ DB Update Error: ${updateError.message}`);
                failedCount++;
            } else {
                console.log('✅ Done');
                migratedCount++;
            }
        } else {
            console.log('⚠️ Skipped (no changes)');
            failedCount++;
        }
    }

    console.log('\n=============================================');
    console.log(`🎉 Migration Completed!`);
    console.log(`   Successfully migrated: ${migratedCount}`);
    console.log(`   Failed / Skipped: ${failedCount}`);
    console.log('=============================================\n');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
