
async function test() {
    const term = 'Mounam Pesiyadhe';
    console.log(`Searching iTunes for: ${term}`);
    const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50&country=IN`
    );
    const data = await response.json();
    console.log(`Found ${data.resultCount} results`);
    data.results.forEach(r => console.log(`- ${r.trackName} (${r.collectionName})`));
}
test();
