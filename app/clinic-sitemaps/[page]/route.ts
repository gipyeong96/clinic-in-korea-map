import {excludedFromSearch} from '@/lib/profile-indexing';
import { supabase } from '@/lib/supabase';
import { SITE_URL, clinicPath } from '@/lib/site';
import { CLINIC_SITEMAP_SIZE, sitemapXml, sitemapResponse } from '@/lib/sitemap-xml';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:{page:string}}){
  if(!/^(0|[1-9]\d{0,3})\.xml$/.test(params.page))return new Response('Not found',{status:404});
  const page=Number(params.page.slice(0,-4));
  const {data,error}=await supabase.from('clinics').select('id,hira_code').order('id').range(page*CLINIC_SITEMAP_SIZE,(page+1)*CLINIC_SITEMAP_SIZE-1);
  if(error)return new Response('Sitemap temporarily unavailable',{status:503});
  if(!data?.length)return new Response('Not found',{status:404});
  return sitemapResponse(sitemapXml(Array.from(new Set(data.filter(c=>!excludedFromSearch(c)).map(c=>`${SITE_URL}${clinicPath(c)}`)))));
}
