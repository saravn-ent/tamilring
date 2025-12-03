export const searchSingers = async (songTitle: string, movieName: string): Promise<string> => {
  const term = `${songTitle} ${movieName}`;
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`);
    if (!res.ok) throw new Error('Failed to fetch singers');
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].artistName;
    }
    return '';
  } catch (error) {
    console.error(error);
    return '';
  }
};
