
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

async function searchPerson(query: string) {
    const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
    const data = await res.json();
    return data.results?.[0] || null;
}

async function debug() {
    console.log('--- Debugging Top Artists Logic ---');

    const lang = 'tamil';
    let query = supabase
        .from('ringtones')
        .select('music_director, singers, tags, cast_members, movie_director')
        .eq('status', 'approved');

    if (lang === 'tamil') {
        query = query.or('language.eq.tamil,language.is.null');
    } else {
        query = query.eq('language', lang);
    }

    const { data: ringtones, error } = await query;
    if (error) {
        console.error('Query Error:', error);
        return;
    }

    console.log('Total ringtones fetched:', ringtones?.length);

    const singerCounts: Record<string, number> = {};
    const mdCounts: Record<string, number> = {};
    const actorCounts: Record<string, number> = {};
    const directorCounts: Record<string, number> = {};

    ringtones.forEach(r => {
        if (r.music_director) {
            r.music_director.split(/,|&|feat\.|ft\./i).forEach(n => {
                const name = n.trim();
                if (name.length > 2) mdCounts[name] = (mdCounts[name] || 0) + 1;
            });
        }
        if (r.singers) {
            r.singers.split(/,|&|feat\.|ft\./i).forEach(n => {
                const name = n.trim().replace(/\(.*\)/g, '').trim();
                if (name.length > 2) singerCounts[name] = (singerCounts[name] || 0) + 1;
            });
        }
        if (r.cast_members) {
            r.cast_members.split(/,|&|feat\.|ft\./i).forEach(n => {
                const name = n.trim();
                if (name.length > 2) actorCounts[name] = (actorCounts[name] || 0) + 1;
            });
        }
        if (r.movie_director) {
            r.movie_director.split(/,|&|feat\.|ft\./i).forEach(n => {
                const name = n.trim();
                if (name.length > 2) directorCounts[name] = (directorCounts[name] || 0) + 1;
            });
        }
    });

    const getTop = (counts: Record<string, number>) => Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(e => e[0]);

    console.log('Top Singers candidates:', getTop(singerCounts));
    console.log('Top MDs candidates:', getTop(mdCounts));
    console.log('Top Actors candidates:', getTop(actorCounts));
    console.log('Top Directors candidates:', getTop(directorCounts));

    // Test enrichment for one candidate
    const testName = getTop(singerCounts)[0];
    if (testName) {
        const p = await searchPerson(testName);
        console.log(`TMDB check for "${testName}":`, p ? { name: p.name, dept: p.known_for_department, gender: p.gender, profile: p.profile_path } : 'NOT FOUND');
    }
}

debug();
