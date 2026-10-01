const fs = require('fs');
try {
    const report = JSON.parse(fs.readFileSync('./lighthouse-report-unblocked.json', 'utf8'));
    const categories = report.categories;
    console.log('Performance:', categories.performance.score * 100);
    const audits = report.audits;
    console.log('FCP:', audits['first-contentful-paint'].displayValue);
    console.log('LCP:', audits['largest-contentful-paint'].displayValue);
} catch (e) {
    console.error(e);
}
