
const TMDB_API_KEY = '565f409b9c46bedc1fc2a9165c7d0666';
const query = 'Neelavukku Neranja Manasu';
const BASE_URL = 'https://api.themoviedb.org/3';

async function test() {
    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`);
        const data = await res.json();
        console.log('Results count:', data.results.length);
        if (data.results.length > 0) {
            console.log('First result:', JSON.stringify(data.results[0], null, 2));
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

test();
