export interface iTunesRing {
  trackName: string;
  artistName: string;
  collectionName: string;
  previewUrl: string;
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
