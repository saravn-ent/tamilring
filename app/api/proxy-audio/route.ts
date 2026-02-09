import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);

        // Get the blob of the audio
        const blob = await response.blob();

        // Prepare headers
        const headers = new Headers();
        headers.set('Content-Type', blob.type || 'audio/mpeg');
        // CRITICAL: This allows the resource to be loaded by a page with COEP: require-corp
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(blob, { headers });
    } catch (error) {
        console.error('Proxy Audio Error:', error);
        return new NextResponse('Failed to fetch audio', { status: 500 });
    }
}
