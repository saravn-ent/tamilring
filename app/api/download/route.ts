import { NextRequest, NextResponse } from 'next/server';
import { incrementDownloads } from '@/app/actions/ringtones';
import NodeID3 from 'node-id3';

export const runtime = 'nodejs'; // Required for node-id3 (uses Node.js Buffer)

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || 'ringtone.mp3';
    const id = searchParams.get('id');

    // Metadata params (optional, for ID3 tagging)
    const title = searchParams.get('title') || '';
    const artist = searchParams.get('artist') || '';
    const album = searchParams.get('album') || '';
    const posterUrl = searchParams.get('poster') || '';

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // 1. Increment Download Count (Fire & Forget to not block download)
        if (id) {
            incrementDownloads(id).catch(err =>
                console.error('Download increment failed:', err)
            );
        }

        // 2. Fetch the audio file in parallel with the poster image
        const audioPromise = fetch(url);
        const posterPromise = posterUrl ? fetch(posterUrl).catch(() => null) : Promise.resolve(null);

        const [audioResponse, posterResponse] = await Promise.all([audioPromise, posterPromise]);

        if (!audioResponse.ok) throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
        if (!audioResponse.body) throw new Error('Response body is empty');

        // 3. Read the audio into a buffer so we can write ID3 tags
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

        // 4. Build ID3 tags
        const tags: NodeID3.Tags = {};

        if (title) tags.title = title;
        if (artist) tags.artist = artist;
        if (album) {
            tags.album = album;
        }

        // Embed the album art (poster image)
        if (posterResponse && posterResponse.ok) {
            try {
                const posterBuffer = Buffer.from(await posterResponse.arrayBuffer());
                const contentType = posterResponse.headers.get('content-type') || 'image/jpeg';
                tags.image = {
                    mime: contentType,
                    type: { id: 3, name: 'front cover' }, // ID 3 = Front Cover
                    description: 'Cover',
                    imageBuffer: posterBuffer,
                };
            } catch (imgErr) {
                console.warn('Failed to embed album art:', imgErr);
            }
        }

        // Also add a comment so users know where it came from
        tags.comment = {
            language: 'eng',
            text: 'Downloaded from TamilRing.in',
        };

        // 5. Write the tags into the audio buffer
        let finalBuffer: Buffer;
        try {
            const taggedBuffer = NodeID3.write(tags, audioBuffer);
            finalBuffer = Buffer.isBuffer(taggedBuffer) ? taggedBuffer : audioBuffer;
        } catch (tagErr) {
            console.warn('ID3 tagging failed, serving raw audio:', tagErr);
            finalBuffer = audioBuffer;
        }

        // 6. Build response headers
        const headers = new Headers();
        headers.set('Content-Type', 'audio/mpeg');
        headers.set('Content-Length', finalBuffer.length.toString());

        // UTF-8 safe Content-Disposition
        const encodedFilename = encodeURIComponent(filename)
            .replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

        headers.set('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodedFilename}`);
        headers.set('Access-Control-Expose-Headers', 'Content-Disposition');
        headers.set('Cache-Control', 'public, max-age=3600');
        headers.set('Access-Control-Allow-Origin', '*');

        return new NextResponse(new Uint8Array(finalBuffer), { headers });

    } catch (error) {
        console.error('Download API Error:', error);
        return new NextResponse('Failed to process download: ' + (error instanceof Error ? error.message : 'Unknown error'), { status: 500 });
    }
}
