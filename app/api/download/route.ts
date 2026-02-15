import { NextRequest, NextResponse } from 'next/server';
import { incrementDownloads } from '@/app/actions/ringtones';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || 'ringtone.mp3';
    const id = searchParams.get('id');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // 1. Increment Download Count (Fire & Forget to not block download)
        if (id) {
            // We don't await this to ensure the download starts immediately
            incrementDownloads(id).catch(err => 
                console.error('Download increment failed:', err)
            );
        }

        // 2. Fetch the file
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);

        // 3. Prepare response with correct headers for download
        const contentType = response.headers.get('content-type') || 'audio/mpeg';
        
        // Create a new response with the body stream
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        
        // Add CORS headers just in case
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=3600');

        return new NextResponse(response.body, { headers });

    } catch (error) {
        console.error('Download API Error:', error);
        return new NextResponse('Failed to process download', { status: 500 });
    }
}
