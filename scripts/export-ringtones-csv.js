const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.error('Error loading .env.local', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportToCSV() {
    console.log('Fetching all ringtones...');
    
    let allRingtones = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('ringtones')
            .select('id, title, audio_url, poster_url, movie_name, mood, tags, downloads, created_at, singers, music_director')
            .order('id', { ascending: true })
            .range(from, to);

        if (error) {
            console.error('Error fetching data:', error);
            break;
        }

        if (data && data.length > 0) {
            allRingtones = allRingtones.concat(data);
            if (data.length < 1000) {
                hasMore = false;
            } else {
                from += 1000;
                to += 1000;
                console.log(`Fetched ${allRingtones.length} records...`);
            }
        } else {
            hasMore = false;
        }
    }

    if (allRingtones.length === 0) {
        console.log('No ringtones found to export.');
        return;
    }

    // Prepare CSV header
    const headers = ['ID', 'Title', 'Audio Link', 'Poster Link', 'Movie Name', 'Singers', 'Music Director', 'Mood', 'Tags', 'Downloads', 'Created At'];
    
    // Helper function to handle possible arrays/strings
    const formatValue = (val) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.join(', ');
        return String(val);
    };

    // Prepare CSV rows
    const rows = allRingtones.map(r => {
        return [
            r.id,
            `"${(r.title || '').replace(/"/g, '""')}"`,
            r.audio_url || '',
            r.poster_url || '',
            `"${(r.movie_name || '').replace(/"/g, '""')}"`,
            `"${formatValue(r.singers).replace(/"/g, '""')}"`,
            `"${(r.music_director || '').replace(/"/g, '""')}"`,
            r.mood || '',
            `"${formatValue(r.tags).replace(/"/g, '""')}"`,
            r.downloads || 0,
            r.created_at
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const outputPath = path.resolve(__dirname, '../ringtones_backup.csv');
    
    fs.writeFileSync(outputPath, csvContent);
    console.log('-----------------------------------');
    console.log(`✅ Success! Exported ${allRingtones.length} ringtones.`);
    console.log(`📂 File saved to: ${outputPath}`);
    console.log('-----------------------------------');
}

exportToCSV();
