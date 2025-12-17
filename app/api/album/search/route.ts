import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const artist = searchParams.get('artist');
    const song = searchParams.get('song');

    if (!artist && !song) {
        return Response.json({ error: 'Artist or song parameter required' }, { status: 400 });
    }

    try {
        // Build search term
        let searchTerm = '';
        if (artist && song) {
            searchTerm = `${artist} ${song}`;
        } else if (artist) {
            searchTerm = artist;
        } else {
            searchTerm = song!;
        }

        // Search iTunes India store
        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=30&country=IN`
        );

        const data = await response.json();

        // Return all results (no genre filtering for independent artists)
        const songs = data.results.map((song: any) => ({
            trackName: song.trackName,
            artistName: song.artistName,
            collectionName: song.collectionName,
            previewUrl: song.previewUrl,
            artworkUrl100: song.artworkUrl100,
            primaryGenreName: song.primaryGenreName
        }));

        return Response.json(songs);
    } catch (error) {
        console.error('iTunes API Error:', error);
        return Response.json({ error: 'Failed to fetch songs' }, { status: 500 });
    }
}
