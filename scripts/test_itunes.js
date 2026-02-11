
const { getSongsByMovie } = require('./lib/itunes');

async function test() {
    console.log('Fetching songs for Mounam Pesiyadhe...');
    const songs = await getSongsByMovie('Mounam Pesiyadhe');
    console.log(`Found ${songs.length} songs`);
    songs.forEach(s => console.log(`- ${s.trackName}`));
}
test();
