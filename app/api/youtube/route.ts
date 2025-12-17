
import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const runtime = 'nodejs'; // Required for ytdl-core (uses internal modules)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url || !ytdl.validateURL(url)) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // List of Cobalt instances to try (Main + Mirrors)
    const COBALT_INSTANCES = [
        'https://api.cobalt.tools/api/json',
        'https://co.wuk.sh/api/json',
        'https://cobalt.api.kwiatekmiki.pl/api/json',
        'https://api.oxcdf.com/api/json'
    ];

    const tryCobalt = async (apiUrl: string) => {
        try {
            // console.log(`Attempting Cobalt API (${apiUrl})...`); // Reduce spam
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Origin': 'https://cobalt.tools',
                    'Referer': 'https://cobalt.tools/'
                },
                body: JSON.stringify({
                    url: url,
                    isAudioOnly: true,
                    aFormat: 'mp3',
                    // "Hacker" mode: minimal tracking, forceful mode often helps
                    dubbed: false,
                    disableMetadata: true
                })
            });

            if (!response.ok) return null;

            const data = await response.json();
            if (data && data.url) return data.url;

            // Check for pickle mode or other stream types if standard URL fails? 
            // Usually data.url is what we want.
            return null;
        } catch (e) {
            // console.warn(`Cobalt API (${apiUrl}) failed.`);
            return null;
        }
    };

    try {
        let streamUrl: string | null = null;
        let usedMethod = '';

        // Strategy 1: Aggressive Cobalt Mirror Cycling
        console.log(`[YouTubeRouter] Starting fetch for: ${url}`);

        for (const instance of COBALT_INSTANCES) {
            streamUrl = await tryCobalt(instance);
            if (streamUrl) {
                usedMethod = `Cobalt (${instance})`;
                break;
            }
        }

        // Strategy 2: ytdl-core with "TV" client (often bypasses age-gates/throttling)
        if (!streamUrl) {
            try {
                console.log('[YouTubeRouter] All Cobalt mirrors failed. Attempting ytdl-core...');
                const info = await ytdl.getInfo(url, {
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': 'https://www.youtube.com/'
                        }
                    },
                    // Using Android client sometimes yields better results for audio
                    lang: 'en'
                });

                const format = ytdl.chooseFormat(info.formats, {
                    quality: 'highestaudio',
                    filter: 'audioonly'
                });

                if (format && format.url) {
                    streamUrl = format.url;
                    usedMethod = 'ytdl-core';
                }
            } catch (e: any) {
                console.warn('[YouTubeRouter] ytdl-core failed:', e.message);
            }
        }

        if (!streamUrl) {
            throw new Error('Unable to download audio. All servers and mirrors are currently busy or blocking the request.');
        }

        console.log(`[YouTubeRouter] Success via ${usedMethod}`);

        // Proxy the stream
        const response = await fetch(streamUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                // Important for some CDN streams
                'Referer': 'https://www.youtube.com/'
            }
        });

        if (!response.ok) {
            throw new Error(`Stream fetch failed: ${response.status} ${response.statusText}`);
        }

        return proxyResponse(response);

    } catch (error: any) {
        console.error('[YouTubeRouter] Fatal Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process video' },
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
