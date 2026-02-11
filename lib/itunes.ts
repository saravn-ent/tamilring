export interface iTunesRing {
  trackName: string;
  artistName: string;
  collectionName: string;
  previewUrl: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
}

export const searchRings = async (term: string, entity: string = 'song'): Promise<iTunesRing[]> => {
  try {
    // 1. Try Indian Store first (Best for Tamil rings)
    let response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=15&country=IN`
    );
    let data = await response.json();

    // 2. Fallback to US Store if no results
    if (data.resultCount === 0) {
      response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=15&country=US`
      );
      data = await response.json();
    }

    if (data.resultCount > 0) {
      return data.results.map((item: any) => ({
        trackName: item.trackName,
        artistName: item.artistName,
        collectionName: item.collectionName,
        previewUrl: item.previewUrl
      }));
    }

    return [];
  } catch (error) {
    console.error('iTunes API Error:', error);
    return [];
  }
};

export const getSongsByMovie = async (movieName: string): Promise<iTunesRing[]> => {
  try {
    // Search broadly for songs with the movie name
    const term = `${movieName}`;
    // Try Indian store first
    let response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50&country=IN`
    );
    let data = await response.json();

    // Fallback to US
    if (data.resultCount === 0) {
      response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50&country=US`
      );
      data = await response.json();
    }

    if (data.resultCount > 0) {
      // Filter: Collection Name must loosely match the Movie Name
      const normalize = (s: string) => s.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/th/g, 't')
        .replace(/d/g, 't'); // Normalize d/t variations common in South Indian names

      const normalizedMovie = normalize(movieName);

      const refined = data.results.filter((item: any) => {
        const collection = normalize(item.collectionName || '');
        const trackNameLow = (item.trackName || '').toLowerCase();

        // Filter out Remixes and Altered Versions
        const blacklist = ['remix', 'version', 'karaoke', 'instrumental', 'reprise', 'mix', 'lofi', 'slowed'];
        if (blacklist.some(word => trackNameLow.includes(word))) return false;

        return collection.includes(normalizedMovie);
      }).map((item: any) => ({
        trackName: item.trackName,
        artistName: item.artistName,
        collectionName: item.collectionName,
        previewUrl: item.previewUrl,
        artworkUrl100: item.artworkUrl100,
        primaryGenreName: item.primaryGenreName
      }));

      return refined;
    }

    return [];
  } catch (error) {
    console.error('iTunes API Error:', error);
    return [];
  }
};
