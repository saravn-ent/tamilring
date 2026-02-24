const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Default Admin User ID for uploads if not provided in metadata
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'; // Placeholder - will attempt to get from env or first admin

async function getAdminId() {
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1)
        .single();
    return profile?.id || DEFAULT_USER_ID;
}

function generateSlug(title, movieName) {
    const text = `${title} ${movieName}`.toLowerCase();
    return text.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function uploadFile(bucket, filePath, fileName, contentType) {
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
            contentType,
            upsert: true
        });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
}

async function processUpload(row, baseDir, adminId) {
    const {
        title,
        movie_name,
        song_name,
        singers,
        music_director,
        tags,
        language,
        mood,
        file_name,
        poster_file
    } = row;

    console.log(`\nProcessing: ${title} (${movie_name})`);

    try {
        const audioPath = path.join(baseDir, file_name);
        if (!fs.existsSync(audioPath)) {
            console.error(`- Audio file not found: ${audioPath}`);
            return;
        }

        const slug = generateSlug(title, movie_name || '');
        const timestamp = Date.now();
        const storageAudioName = `${adminId}/${slug}-${timestamp}${path.extname(file_name)}`;

        // 1. Upload Audio
        console.log(`- Uploading audio...`);
        const audioUrl = await uploadFile('ringtone-files', audioPath, storageAudioName, 'audio/mpeg');

        // 2. Upload Poster if provided
        let posterUrl = null;
        if (poster_file) {
            const posterPath = path.join(baseDir, poster_file);
            if (fs.existsSync(posterPath)) {
                console.log(`- Uploading poster...`);
                const storagePosterName = `posters/${slug}-${timestamp}${path.extname(poster_file)}`;
                posterUrl = await uploadFile('ringtone-files', posterPath, storagePosterName, 'image/jpeg');
            }
        }

        // 3. Prepare Tags
        const tagList = tags ? tags.split(',').map(t => t.trim()) : [];
        if (mood) tagList.push(mood);

        // 4. Insert into DB
        console.log(`- Inserting into database...`);
        const { error: dbError } = await supabase
            .from('ringtones')
            .insert({
                user_id: adminId,
                title,
                song_name: song_name || null,
                movie_name: movie_name || null,
                slug,
                audio_url: audioUrl,
                poster_url: posterUrl,
                singers: singers || null,
                music_director: music_director || null,
                tags: tagList,
                language: language || 'tamil',
                status: 'approved',
                downloads: 0
            });

        if (dbError) throw dbError;
        console.log(`✅ Success!`);

    } catch (err) {
        console.error(`❌ Error processing ${title}:`, err.message);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const dirIndex = args.indexOf('--dir');
    const metaIndex = args.indexOf('--metadata');

    if (dirIndex === -1 || metaIndex === -1) {
        console.log('Usage: node scripts/bulk_upload.js --dir <directory> --metadata <metadata.csv>');
        process.exit(1);
    }

    const baseDir = args[dirIndex + 1];
    const metadataPath = args[metaIndex + 1];

    if (!fs.existsSync(baseDir) || !fs.existsSync(metadataPath)) {
        console.error('Directory or metadata file does not exist.');
        process.exit(1);
    }

    const adminId = await getAdminId();
    console.log(`Using Admin ID: ${adminId}`);

    const results = [];
    
    await new Promise((resolve, reject) => {
        fs.createReadStream(metadataPath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Found ${results.length} records in metadata. Starting upload...`);
    
    for (const row of results) {
        // Handle potential empty rows or parsing issues
        if (!row.title || !row.file_name) {
            console.warn(`- Skipping invalid row: ${JSON.stringify(row)}`);
            continue;
        }
        await processUpload(row, baseDir, adminId);
    }

    console.log('\nBulk upload complete!');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

