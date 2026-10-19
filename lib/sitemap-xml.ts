// Stay within the database API's default 1,000-row response cap.
export const CLINIC_SITEMAP_SIZE=1000;
export function escapeXml(value:string){return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
export function sitemapXml(urls:string[],index=false){
  const root=index?'sitemapindex':'urlset',entry=index?'sitemap':'url';
  return `<?xml version="1.0" encoding="UTF-8"?><${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<${entry}><loc>${escapeXml(url)}</loc></${entry}>`).join('')}</${root}>`;
}
export function sitemapResponse(body:string){return new Response(body,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, s-maxage=3600, stale-while-revalidate=3600'}});}
