const https = require('https');

const urls = [
    'https://image.tmdb.org/t/p/w342/aAh6G5KR3SsyvCQUML6bsLL9YqG.jpg',
    'https://image.tmdb.org/t/p/w342/g1J7jWk5gTuvycRANLb171kxsGb.jpg',
    'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/b3/5e/0f/b35e0fbe-2370-fc48-0f0c-977525e93bf2/720841214601_Cover.jpg/600x600bb.jpg'
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(`${url} -> ${res.statusCode}`);
        }).on('error', (err) => {
            resolve(`${url} -> ERROR: ${err.message}`);
        });
    });
}

async function checkUrls() {
    for (const url of urls) {
        const result = await checkUrl(url);
        console.log(result);
    }
}

checkUrls();
