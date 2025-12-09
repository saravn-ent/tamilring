
async function getSongsForMovie(movieName) {
    // Search for the album/movie first to get accurate collection
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(movieName)}&media=music&entity=song&limit=50`;
    const res = await fetch(url);
    const data = await res.json();

    console.log(`Songs for Movie "${movieName}":`);

    // Simple heuristic: Filter results that contain the movie name in collectionName
    const exactMatches = data.results.filter(r =>
        r.collectionName.toLowerCase().includes(movieName.toLowerCase())
    );

    if (exactMatches.length > 0) {
        console.log(`Found ${exactMatches.length} matches in relevant albums:`);
        exactMatches.forEach(r => {
            console.log(`- ${r.trackName} | Album: ${r.collectionName} | Artists: ${r.artistName}`);
        });
    } else {
        console.log("No exact album matches found. Raw results:");
        data.results.slice(0, 5).forEach(r => {
            console.log(`- ${r.trackName} | Album: ${r.collectionName}`);
        });
    }
}

getSongsForMovie("Thegidi");
