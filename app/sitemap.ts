import { MetadataRoute } from 'next';
import { mockClinics } from '@/lib/supabase';

const BASE_URL = 'https://koreaclinicmap.com';

const departments = ['all', 'urology', 'dentistry', 'internal-medicine', 'dermatology', 'plastic-surgery'];
const locations = ['all', 'gangnam', 'seoul-station', 'jamsil', 'incheon', 'dongtan'];
const locales = ['en', 'mn'];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // 1. Static main routes per locale
  locales.forEach((lang) => {
    routes.push({
      url: `${BASE_URL}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
  });

  // 2. Programmatic SEO list pages (/clinics/[department]/[location])
  locales.forEach((lang) => {
    departments.forEach((dept) => {
      locations.forEach((loc) => {
        routes.push({
          url: `${BASE_URL}/${lang}/clinics/${dept}/${loc}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    });
  });

  // 3. Dynamic Clinic Detail Pages (/clinics/detail/[id])
  locales.forEach((lang) => {
    mockClinics.forEach((clinic) => {
      routes.push({
        url: `${BASE_URL}/${lang}/clinics/detail/${clinic.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  });

  // 4. Article pages
  locales.forEach((lang) => {
    // Index page
    routes.push({
      url: `${BASE_URL}/${lang}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    });

    // Detail pages
    routes.push({
      url: `${BASE_URL}/${lang}/articles/things-to-know-before-visiting-urology-clinic`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  return routes;
}
