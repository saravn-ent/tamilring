import { NextRequest, NextResponse } from 'next/server';
import { incrementDownloads } from '@/app/actions/ringtones';
import NodeID3 from 'node-id3';

export const runtime = 'nodejs'; // Required for node-id3 (uses Node.js Buffer)

// ---------------------------------------------------------------------------
// Helper: shrink image URL to smallest usable variant to speed up embed
// ---------------------------------------------------------------------------
function optimizePosterUrl(posterUrl: string): string {
    // TMDB: swap any size (w500, w780, original, etc.) to w92 — ~5–10KB
    if (posterUrl.includes('image.tmdb.org')) {
        return posterUrl.replace(/\/t\/p\/[^/]+\//, '/t/p/w92/');
    }
    // Supabase storage: append resize transform if the bucket supports it
    // (works if Image Transformation add-on is enabled on the project)
    if (posterUrl.includes('.supabase.co/storage')) {
        try {
            const u = new URL(posterUrl);
            u.searchParams.set('width', '128');
            u.searchParams.set('quality', '60');
            return u.toString();
        } catch {
            return posterUrl;
        }
    }
    return posterUrl;
}

// ---------------------------------------------------------------------------
// Helper: fetch with a hard timeout
// ---------------------------------------------------------------------------
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return res.ok ? res : null;
    } catch {
        clearTimeout(timer);
        return null; // timed-out or network error — gracefully skip
    }
}

// ---------------------------------------------------------------------------
// POST: analytics-only (fire-and-forget from client)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return new NextResponse('Missing id', { status: 400 });

    try {
        await incrementDownloads(id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Download increment failed:', error);
        return new NextResponse('Failed', { status: 500 });
    }
}

// ---------------------------------------------------------------------------
// GET: fetch audio + embed ID3 tags + return tagged file
//
// SPEED TRICK: Cache-Control with s-maxage=604800 means Vercel's edge CDN
// caches this response for 7 days keyed by URL (which includes ringtone id).
// ✅ First download of any ringtone: hits the origin server once (~1-3s).
// ⚡ Every download after that: served from Vercel edge in <100ms worldwide.
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || 'ringtone.mp3';
    const id = searchParams.get('id');

    // Metadata for ID3 tags
    const title = searchParams.get('title') || '';
    const artist = searchParams.get('artist') || '';
    const album = searchParams.get('album') || '';
    const rawPosterUrl = searchParams.get('poster') || '';

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // Track download in background — never blocks file delivery
        if (id) {
            incrementDownloads(id).catch(err =>
                console.error('Download increment failed:', err)
            );
        }

        // Optimise poster URL to smallest usable variant
        const posterUrl = rawPosterUrl ? optimizePosterUrl(rawPosterUrl) : '';

        // Fetch audio + poster in parallel.
        // Poster has a hard 1.5s timeout — if it doesn't arrive in time we
        // embed no album art rather than making the user wait longer.
        const [audioResponse, posterResponse] = await Promise.all([
            fetch(url),
            posterUrl ? fetchWithTimeout(posterUrl, 1500) : Promise.resolve(null),
        ]);

        if (!audioResponse.ok) {
            throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
        }

        // Read audio buffer
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

        // Build ID3 tags
        const tags: NodeID3.Tags = {};
        if (title) tags.title = title;
        if (artist) tags.artist = artist;
        if (album) tags.album = album;
        tags.comment = { language: 'eng', text: 'Downloaded from TamilRing.in' };

        // Embed album art only if poster arrived within 1.5s
        if (posterResponse) {
            try {
                const posterBuffer = Buffer.from(await posterResponse.arrayBuffer());
                const contentType = posterResponse.headers.get('content-type') || 'image/jpeg';
                tags.image = {
                    mime: contentType,
                    type: { id: 3, name: 'front cover' },
                    description: 'Cover',
                    imageBuffer: posterBuffer,
                };
            } catch {
                // Album art embed failed — continue without it
            }
        }

        // Write ID3 tags into audio buffer
        let finalBuffer: Buffer;
        try {
            const tagged = NodeID3.write(tags, audioBuffer);
            finalBuffer = Buffer.isBuffer(tagged) ? tagged : audioBuffer;
        } catch {
            finalBuffer = audioBuffer; // Serve raw audio if tagging fails
        }

        // Build response
        const encodedFilename = encodeURIComponent(filename)
            .replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

        const headers = new Headers({
            'Content-Type': 'audio/mpeg',
            'Content-Length': finalBuffer.length.toString(),
            'Content-Disposition': `attachment; filename="${filename.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodedFilename}`,
            'Access-Control-Expose-Headers': 'Content-Disposition',
            'Access-Control-Allow-Origin': '*',
            // ⚡ Key caching headers:
            // s-maxage=604800 → Vercel edge caches for 7 days (per unique URL)
            // stale-while-revalidate=86400 → serve stale while quietly refreshing
            // max-age=3600 → browser caches for 1 hour (avoids re-download on back)
            'Cache-Control': 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400',
            'Vary': 'Accept-Encoding',
        });

        return new NextResponse(new Uint8Array(finalBuffer), { headers });

    } catch (error) {
        console.error('Download API Error:', error);
        return new NextResponse(
            'Failed to process download: ' + (error instanceof Error ? error.message : 'Unknown error'),
            { status: 500 }
        );
    }
}
