const fs = require('fs');
try {
    const report = JSON.parse(fs.readFileSync('./lighthouse-report-new.json', 'utf8'));
    const requests = report.audits['network-requests'].details.items;

    // Filter valid
    const validRequests = requests.filter(r => r.transferSize > 0);

    // Sort by transfer size
    validRequests.sort((a, b) => b.transferSize - a.transferSize);

    console.log('--- Top 5 Largest Requests ---');
    validRequests.slice(0, 5).forEach(r => {
        console.log(`URL: ${r.url.substring(0, 50)}...`);
        console.log(`Size: ${(r.transferSize / 1024).toFixed(2)} KB`);
        console.log('---');
    });

} catch (e) { console.error(e); }
