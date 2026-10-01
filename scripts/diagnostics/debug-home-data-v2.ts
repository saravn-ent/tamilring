
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

async function searchPerson(query: string) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
        const data = await res.json();
        return data.results?.[0] || null;
    } catch (e) {
        return null;
    }
}

async function debug() {
    let output = '--- Debugging Top Artists Logic ---\n';

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
        output += `Query Error: ${JSON.stringify(error)}\n`;
        fs.writeFileSync('debug_output.txt', output);
        return;
    }

    output += `Total ringtones fetched: ${ringtones?.length}\n`;

    const singerCounts: Record<string, number> = {};
    const mdCounts: Record<string, number> = {};
    const actorCounts: Record<string, number> = {};
    const directorCounts: Record<string, number> = {};

    ringtones.forEach(r => {
        if (r.music_director) {
            r.music_director.split(/,|&|feat\.|ft\./i).forEach((n: string) => {
                const name = n.trim();
                if (name.length > 2) mdCounts[name] = (mdCounts[name] || 0) + 1;
            });
        }
        if (r.singers) {
            r.singers.split(/,|&|feat\.|ft\./i).forEach((n: string) => {
                const name = n.trim().replace(/\(.*\)/g, '').trim();
                if (name.length > 2) singerCounts[name] = (singerCounts[name] || 0) + 1;
            });
        }
        if (r.cast_members) {
            r.cast_members.split(/,|&|feat\.|ft\./i).forEach((n: string) => {
                const name = n.trim();
                if (name.length > 2) actorCounts[name] = (actorCounts[name] || 0) + 1;
            });
        }
        if (r.movie_director) {
            r.movie_director.split(/,|&|feat\.|ft\./i).forEach((n: string) => {
                const name = n.trim();
                if (name.length > 2) directorCounts[name] = (directorCounts[name] || 0) + 1;
            });
        }
    });

    const getTop = (counts: Record<string, number>) => Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(e => `${e[0]} (${e[1]})`);

    output += `Top Singers candidates: ${getTop(singerCounts).join(', ')}\n`;
    output += `Top MDs candidates: ${getTop(mdCounts).join(', ')}\n`;
    output += `Top Actors candidates: ${getTop(actorCounts).join(', ')}\n`;
    output += `Top Directors candidates: ${getTop(directorCounts).join(', ')}\n`;

    // Test a few candidates from each
    const namesToTest = [
        ...getTop(singerCounts).slice(0, 2).map(s => s.split(' (')[0]),
        ...getTop(mdCounts).slice(0, 2).map(s => s.split(' (')[0]),
        ...getTop(actorCounts).slice(0, 2).map(s => s.split(' (')[0]),
        ...getTop(directorCounts).slice(0, 2).map(s => s.split(' (')[0])
    ];

    for (const name of namesToTest) {
        const p = await searchPerson(name);
        output += `TMDB check for "${name}": ${p ? JSON.stringify({ name: p.name, dept: p.known_for_department, gender: p.gender, hasProfile: !!p.profile_path }) : 'NOT FOUND'}\n`;
    }

    fs.writeFileSync('debug_output.txt', output);
    console.log('Debug finished, check debug_output.txt');
}

debug();
