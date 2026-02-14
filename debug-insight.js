const fs = require('fs');
try {
    const report = JSON.parse(fs.readFileSync('./lighthouse-report-new.json', 'utf8'));
    const insight = report.audits['lcp-discovery-insight'];
    if (insight && insight.details) {
        console.log(JSON.stringify(insight.details, null, 2));
    } else {
        console.log('No details for lcp-discovery-insight');
    }
} catch (e) { console.error(e); }
