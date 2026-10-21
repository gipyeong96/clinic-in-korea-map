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
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    {url:`${SITE_URL}/areas`,changeFrequency:'monthly',priority:0.8},
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
    ...mockClinics.map(clinic => ({ url: `${SITE_URL}${clinicPath(clinic)}`, priority: 0.7 })),
    ...mockArticles.map(article => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: article.published_at,
      priority: 0.6,
    })),
  ];
}
