
import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const runtime = 'nodejs'; // Required for ytdl-core (uses internal modules)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extract Video ID manually to avoid library dependencies if possible
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]*)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Decentralized Piped API Mirrors (The "Hacker" Way)
    // These bypass YouTube's direct blocking by using privacy frontends
    const PIPED_INSTANCES = [
        'https://pipedapi.kavin.rocks',
        'https://api.piped.privacy.com.de',
        'https://pipedapi.moomoo.me',
        'https://pipedapi.leptons.xyz',
        'https://pipedapi.smnz.de',
        'https://api.piped.projectsegfau.lt'
    ];

    const fetchFromPiped = async (apiBase: string) => {
        try {
            const res = await fetch(`${apiBase}/streams/${videoId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    };

    try {
        let streamData = null;
        let usedInstance = '';

        console.log(`[YouTubeRouter] Hunting for audio stream: ${videoId}`);

        // 1. Cycle through mirrors until we find a working one
        for (const instance of PIPED_INSTANCES) {
            streamData = await fetchFromPiped(instance);
            if (streamData && streamData.audioStreams && streamData.audioStreams.length > 0) {
                usedInstance = instance;
                break;
            }
        }

        if (!streamData) {
            throw new Error('All privacy instances are currently unreachable. The network might be congested.');
        }

        // 2. Select the best audio stream (m4a usually has higher bitrate than webm/opus for compatibility)
        // We prefer 'm4a' or 'mp3' if available, otherwise highest bitrate
        const audioStreams = streamData.audioStreams;

        // Sort by bitrate descending
        audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate);

        const bestStream = audioStreams.find((s: any) => s.format === 'm4a') || audioStreams[0];

        if (!bestStream) {
            throw new Error('No compatible audio stream found.');
        }

        console.log(`[YouTubeRouter] Locked onto target via ${usedInstance} (${bestStream.quality} | ${bestStream.format})`);

        // 3. Proxy the stream
        const response = await fetch(bestStream.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            }
        });

        if (!response.ok) {
            throw new Error(`Stream download failed: ${response.status}`);
        }

        return proxyResponse(response);

    } catch (error: any) {
        console.error('[YouTubeRouter] Mission Failed:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to extract audio' },
            { status: 500 }
        );
    }
}

function proxyResponse(response: Response) {
    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Content-Disposition', `attachment; filename="audio.mp3"`);
    if (response.headers.get('content-length')) {
        headers.set('Content-Length', response.headers.get('content-length')!);
    }

    return new NextResponse(response.body, {
        status: 200,
        headers,
    });
}
