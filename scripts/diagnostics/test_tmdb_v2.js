
const { searchPerson } = require('./lib/tmdb');

async function test() {
    const names = ['Atlee', 'Rajinikanth', 'Mani Ratnam'];
    for (const name of names) {
        const person = await searchPerson(name);
        console.log(`\n--- TMDB result for "${name}" ---`);
        if (person) {
            console.log(`Name: ${person.name}`);
            console.log(`Dept: ${person.known_for_department}`);
            console.log(`ID: ${person.id}`);
        } else {
            console.log('Not found');
        }
    }
}

test();
