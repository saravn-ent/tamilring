const fs = require('fs');
try {
    const report = JSON.parse(fs.readFileSync('./lighthouse-report-new.json', 'utf8'));
    const lcp = report.audits['largest-contentful-paint'];
    const lcpDiscovery = report.audits['lcp-discovery-insight'];

    console.log('--- LCP Audit ---');
    console.log(JSON.stringify(lcp, null, 2));

    console.log('\n--- LCP Discovery Insight ---');
    console.log(JSON.stringify(lcpDiscovery, null, 2));
} catch (e) { console.error(e); }
