import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const deity = searchParams.get('deity');

    if (!deity) {
        return Response.json({ error: 'Deity parameter required' }, { status: 400 });
    }

    try {
        const searchTerm = `${deity} songs`;

        // Search iTunes India store
        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=30&country=IN`
        );

        const data = await response.json();

        // Filter for Devotional & Spiritual genre
        const devotionalSongs = data.results
            .filter((song: any) => song.primaryGenreName === 'Devotional & Spiritual')
            .map((song: any) => ({
                trackName: song.trackName,
                artistName: song.artistName,
                collectionName: song.collectionName,
                previewUrl: song.previewUrl,
                artworkUrl100: song.artworkUrl100,
                primaryGenreName: song.primaryGenreName
            }));

        return Response.json(devotionalSongs);
    } catch (error) {
        console.error('iTunes API Error:', error);
        return Response.json({ error: 'Failed to fetch songs' }, { status: 500 });
    }
}
