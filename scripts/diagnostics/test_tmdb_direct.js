
const TMDB_API_KEY = '565f409b9c46bedc1fc2a9165c7d0666';
const BASE_URL = 'https://api.themoviedb.org/3';

async function testPerson(name) {
    try {
        const res = await fetch(`${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}&language=en-US&page=1&include_adult=false`);
        const data = await res.json();
        const person = data.results?.[0];
        console.log(`\n--- TMDB result for "${name}" ---`);
        if (person) {
            console.log(`Name: ${person.name}`);
            console.log(`Dept: ${person.known_for_department}`);
            console.log(`ID: ${person.id}`);
        } else {
            console.log('Not found');
        }
    } catch (e) {
        console.error(e.message);
    }
}

async function main() {
    await testPerson('Atlee');
    await testPerson('Rajinikanth');
    await testPerson('Mani Ratnam');
}

main();
