import { supabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/site';
import { CLINIC_SITEMAP_SIZE, sitemapXml, sitemapResponse } from '@/lib/sitemap-xml';
export const dynamic='force-dynamic';
export async function GET(){
  const {count,error}=await supabase.from('clinics').select('id',{head:true,count:'exact'});
  if(error||count===null)return new Response('Sitemap temporarily unavailable',{status:503});
  const urls=Array.from({length:Math.ceil(count/CLINIC_SITEMAP_SIZE)},(_,i)=>`${SITE_URL}/clinic-sitemap-${i}.xml`);
  return sitemapResponse(sitemapXml(urls,true));
}
