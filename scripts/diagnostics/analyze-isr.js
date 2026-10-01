const fs = require('fs');
try {
    const report = JSON.parse(fs.readFileSync('./lighthouse-report-isr.json', 'utf8'));
    const categories = report.categories;
    console.log('Performance:', categories.performance.score * 100);
    console.log('Accessibility:', categories.accessibility.score * 100);
    console.log('Best Practices:', categories['best-practices'].score * 100);
    console.log('SEO:', categories.seo.score * 100);

    const audits = report.audits;
    console.log('FCP:', audits['first-contentful-paint'].displayValue);
    console.log('LCP:', audits['largest-contentful-paint'].displayValue);
    console.log('TBT:', audits['total-blocking-time'].displayValue);
    console.log('CLS:', audits['cumulative-layout-shift'].displayValue);
    console.log('Speed Index:', audits['speed-index'].displayValue);
} catch (e) {
    console.error(e);
}
