import { MetadataRoute } from 'next';
import { mockClinics } from '@/lib/supabase';
import { mockArticles } from '@/lib/articles';
import { SITE_URL, clinicPath } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const departments = ['all', 'urology', 'dentistry', 'internal-medicine', 'dermatology', 'plastic-surgery'];
  const locations = ['all', 'gangnam', 'seoul-station', 'gangnam-station', 'jamsil-station', 'jamsil', 'incheon', 'dongtan'];
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/articles`, changeFrequency: 'monthly', priority: 0.6 },
    ...departments.flatMap(department => locations.map(location => ({
      url: `${SITE_URL}/clinics/${department}/${location}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))),
    ...mockClinics.map(clinic => ({ url: `${SITE_URL}${clinicPath(clinic)}`, priority: 0.7 })),
    ...mockArticles.map(article => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: article.published_at,
      priority: 0.6,
    })),
  ];
}
