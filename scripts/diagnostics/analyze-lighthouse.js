const fs = require('fs');
try {
    const report = JSON.parse(fs.readFileSync('./lighthouse-report-new.json', 'utf8'));
    const audits = report.audits;

    console.log('--- LCP Element ---');
    if (audits['largest-contentful-paint-element'] && audits['largest-contentful-paint-element'].details && audits['largest-contentful-paint-element'].details.items) {
        console.log(JSON.stringify(audits['largest-contentful-paint-element'].details.items, null, 2));
    }

    console.log('\n--- Server Response Time ---');
    console.log(audits['server-response-time'].displayValue);
    console.log(audits['server-response-time'].numericValue + ' ms');

    console.log('\n--- Render Blocking Resources ---');
    if (audits['render-blocking-resources'] && audits['render-blocking-resources'].details && audits['render-blocking-resources'].details.items) {
        audits['render-blocking-resources'].details.items.forEach(item => {
            console.log(item.url);
        });
    }

    console.log('\n--- Offscreen Images ---');
    if (audits['offscreen-images'] && audits['offscreen-images'].details && audits['offscreen-images'].details.items) {
        console.log(audits['offscreen-images'].details.items.length + ' potential offscreen images');
    }

    console.log('\n--- Unsized Images ---');
    if (audits['image-size-responsive'] && audits['image-size-responsive'].details && audits['image-size-responsive'].details.items) {
        console.log(audits['image-size-responsive'].details.items.length + ' images to resize');
    }

} catch (e) {
    console.error(e);
}
