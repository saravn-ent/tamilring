const fs = require('fs');
try {
    const report = JSON.parse(fs.readFileSync('./lighthouse-report-static.json', 'utf8'));
    const categories = report.categories;
    console.log('Performance:', categories.performance.score * 100);
    const audits = report.audits;
    console.log('FCP:', audits['first-contentful-paint'].displayValue);
    console.log('LCP:', audits['largest-contentful-paint'].displayValue);
    console.log('TTFB:', audits['server-response-time'].displayValue);
} catch (e) {
    console.error(e);
}
