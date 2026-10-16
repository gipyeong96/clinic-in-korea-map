const assert = require('node:assert/strict');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3033';
async function get(path, options) { const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30000), ...options }); return { response, html: await response.text() }; }
(async () => {
  const home = await get('/');
  assert.equal(home.response.status, 200);
  assert(home.html.includes('Find English-speaking clinics near you in Korea'));
  assert(home.html.includes('PREMIUM') || home.html.includes('Premium Certified'));
  for (const locale of ['en', 'mn']) {
    const legacy = await get(`/${locale}/clinics/urology/seoul-station?q=Goldman`, { redirect: 'manual' });
    assert.equal(legacy.response.status, 308);
    assert.equal(legacy.response.headers.get('location'), '/clinics/urology/seoul-station?q=Goldman');
  }
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.response.status, 200);
  const urls = [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(urls.length, 42);
  assert(urls.every(url => url.startsWith('https://map.clinicinkorea.com')));
  assert(urls.every(url => !/\/(en|mn)(\/|$)/.test(url)));
  const robots = await get('/robots.txt');
  assert(robots.html.includes('Sitemap: https://map.clinicinkorea.com/sitemap.xml'));
  const detail = await get('/clinics/detail/goldman-gangnam');
  assert.equal(detail.response.status, 200);
  assert(detail.html.includes('rel="canonical" href="https://map.clinicinkorea.com/clinics/detail/goldman-gangnam"'));
  assert(detail.html.includes('Premium Verified'));
  assert(!detail.html.includes('/detail/undefined'));
  const missing = await get('/clinics/all/all?q=zzzz-no-such-clinic');
  assert(missing.html.includes('Showing 0 clinic profiles.'));
  const combined = await get('/clinics/all/all?q=Goldman%20zzzz-no-such-clinic');
  assert(combined.html.includes('Showing 0 clinic profiles.'));
  const match = await get('/clinics/urology/seoul-station?q=Goldman');
  assert(match.html.includes('Showing 1 clinic profiles.'));
  assert(match.html.includes('Premium Certified'));
  const invalid = await get('/clinics/unknown/all');
  assert.equal(invalid.response.status, 404);
  console.log('HTTP checks passed: preserved copy/badges, redirects, 42 sitemap URLs, robots, canonical, keyword AND search, duplicate display, 404.');
})().catch(error => { console.error(error); process.exitCode = 1; });
