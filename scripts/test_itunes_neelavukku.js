
async function test() {
    const term = 'Neelavukku Neranja Manasu';
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=5&country=IN`);
        const data = await response.json();
        console.log('iTunes Results count:', data.resultCount);
        if (data.resultCount > 0) {
            console.log('First result:', JSON.stringify(data.results[0], null, 2));
        }
    } catch (error) {
        console.error('iTunes API Error:', error);
    }
}
test();
