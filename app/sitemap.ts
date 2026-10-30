import {urologyAreaLinks} from '@/lib/urology-discovery';
import {conditionGuides,conditionGuidePath} from '@/lib/condition-guides';
import {indexableConditionPages} from '@/lib/condition-pages';
import {careGuides} from '@/lib/care-guides';
import {urologyVisitGuides,visitGuidePath,visitGuideUpdated} from '@/lib/urology-visit-guides';
import {additionalGoldmanClinics} from '@/lib/goldman';
import { MetadataRoute } from 'next';
import { mockClinics } from '@/lib/supabase';
import { mockArticles } from '@/lib/articles';
import { stationPages } from '@/lib/stations';
import { stationRegions } from '@/lib/station-regions';
import { SITE_URL, clinicPath } from '@/lib/site';
import {nationalAreas,nationalProvinces} from '@/lib/national-regions';

export default function sitemap(): MetadataRoute.Sitemap {
  const departments = ['all', 'urology', 'dentistry', 'internal-medicine', 'dermatology', 'plastic-surgery'];
  const locations = ['all', 'gangnam', 'seoul-station', 'gangnam-station', 'jamsil-station', 'jamsil', 'incheon', 'dongtan', 'busan', 'daegu', 'daejeon', 'gwangju', 'ulsan', 'jeju'];
  return [
    {url:`${SITE_URL}/emergency`,priority:0.7},
    ...urologyAreaLinks.filter(([slug])=>!locations.includes(slug)).map(([slug])=>({url:`${SITE_URL}/clinics/urology/${slug}`,priority:0.8})),
    ...conditionGuides.map(g=>({url:`${SITE_URL}${conditionGuidePath(g.condition)}`,priority:0.6})),
    {url:`${SITE_URL}/conditions`,priority:0.6},
    ...indexableConditionPages.map(p=>({url:`${SITE_URL}${p.path}`,priority:0.6})),
    {url:`${SITE_URL}/guides`,priority:0.6},
    ...urologyVisitGuides.map(g=>({url:SITE_URL+visitGuidePath(g.slug),lastModified:visitGuideUpdated,priority:0.6})),
    ...careGuides.map(guide=>({url:`${SITE_URL}/guides/${guide.slug}`,priority:0.6})),
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    {url:`${SITE_URL}/areas`,changeFrequency:'monthly',priority:0.8},
    ...nationalProvinces.map(p=>({url:`${SITE_URL}/areas/${p.slug}`,changeFrequency:'monthly' as const,priority:0.7})),
    ...[...nationalProvinces,...nationalAreas].filter(a=>!locations.includes(a.slug)).map(a=>({url:`${SITE_URL}/clinics/all/${a.slug}`,changeFrequency:'monthly' as const,priority:0.6})),
    { url: `${SITE_URL}/stations`, changeFrequency: 'monthly', priority: 0.8 },
    ...stationRegions.map(r=>({url:`${SITE_URL}/stations/${r.slug}`,changeFrequency:'monthly' as const,priority:0.7})),
    { url: `${SITE_URL}/articles`, changeFrequency: 'monthly', priority: 0.6 },
    ...departments.flatMap(department => locations.map(location => ({
      url: `${SITE_URL}/clinics/${department}/${location}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))),
    ...stationPages.filter(s => !locations.includes(s.slug)).map(s => ({url: `${SITE_URL}/clinics/all/${s.slug}`, changeFrequency: 'monthly' as const, priority: 0.6})),
    ...[...mockClinics,...additionalGoldmanClinics].map(clinic => ({ url: `${SITE_URL}${clinicPath(clinic)}`, priority: 0.7 })),
    ...mockArticles.map(article => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: article.published_at,
      priority: 0.6,
    })),
  ];
}
