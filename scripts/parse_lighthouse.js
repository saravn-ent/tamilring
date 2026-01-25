const fs = require('fs');

try {
    const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));

    console.log('--- Lighthouse Scores ---');
    Object.values(report.categories).forEach(cat => {
        console.log(`${cat.title}: ${Math.round(cat.score * 100)}`);
    });

    console.log('\n--- Top Performance Opportunities ---');
    const audits = report.audits;
    const performanceAudits = report.categories.performance.auditRefs
        .filter(r => r.weight > 0)
        .map(r => audits[r.id])
        .filter(a => a.score !== 1 && a.scoreDisplayMode !== 'notApplicable')
        .sort((a, b) => (a.score || 0) - (b.score || 0)) // Lower score first
        .slice(0, 5);

    performanceAudits.forEach(audit => {
        console.log(`- ${audit.title} (Score: ${Math.round(audit.score * 100)})`);
        console.log(`  ${audit.displayValue || ''}`);
    });

} catch (e) {
    console.error('Error parsing report:', e);
}
