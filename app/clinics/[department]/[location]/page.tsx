'use strict';

import React from 'react';
import { Locale, getDictionary } from '@/lib/translation';
import { getClinics } from '@/lib/supabase';
import ClinicSearchClient from '@/components/ClinicSearchClient';

interface Params {
  department: string; // e.g., 'urology'
  location: string;   // e.g., 'gangnam'
  disease?: string;   // Note: If we use [...slug], this will need a different structure, but we'll simulate disease here via searchParams for now, or assume Next.js dynamic routes handle it.
}

interface SearchPageProps {
  params: Params;
  searchParams: { q?: string; disease?: string };
}

// Helper to get translated names, including 'all' cases
function getNames(lang: Locale, department: string, location: string, dict: any) {
  const deptName = department === 'all'
    ? (lang === 'mn' ? 'Бүх төрлийн' : 'All Medical')
    : (dict[department as keyof typeof dict] || department);

  const locName = location === 'all'
    ? (lang === 'mn' ? 'Бүх бүс' : 'All Area')
    : (dict[location as keyof typeof dict] || location);

  return { deptName, locName };
}

export async function generateMetadata({ params: { department, location }, searchParams }: SearchPageProps) {
  const lang = 'en' as Locale;
  const dict = getDictionary(lang);
  const { deptName, locName } = getNames(lang, department, location, dict);
  
  // AEO/SEO Disease Prefix logic
  const diseasePrefix = searchParams.disease ? `${searchParams.disease.toUpperCase()} Testing & Treatment - ` : '';
  
  const title = `${diseasePrefix}${locName} ${deptName} Clinics | Korea Clinic Map`;
  const description = `List of ${deptName} clinics and hospitals located in ${locName}. Find addresses, telephone numbers, and operating hours based on public healthcare data.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://koreaclinicmap.com/clinics/${department}/${location}`,
    }
  };
}

export default async function SearchPage({ params: { department, location }, searchParams }: SearchPageProps) {
  const lang = "en" as any;
  const dict = getDictionary(lang);
  
  // Fetch real data from Supabase
  const filteredClinics = await getClinics({ 
    categorySlug: department, 
    locationSlug: location,
    limit: 100 // Prevent crashing the browser while testing
  });

  const { deptName, locName } = getNames(lang, department, location, dict);

  // Compute map center (fallback to Seoul City Hall if empty)
  const mapCenter = filteredClinics.length > 0 
    ? { lat: filteredClinics[0].latitude, lng: filteredClinics[0].longitude }
    : { lat: 37.5665, lng: 126.9780 };

  // Render header templates localized properly
  const diseasePrefix = searchParams.disease ? `${searchParams.disease.toUpperCase()} at ` : '';
  const headerTitle = `${diseasePrefix}${deptName} Clinics in ${locName}`;
  const matchDescription = `${filteredClinics.length} clinics found based on public health data.`;

  // ItemList Schema for GEO/SEO
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": filteredClinics.map((clinic, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://koreaclinicmap.com/clinics/detail/${clinic.hira_code}`
    }))
  };

  // Place Schema for GEO mapping
  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": locName,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KR",
      "addressRegion": locName
    }
  };

  const isDiseaseSearch = !!searchParams.disease;
  const hasPremium = filteredClinics.some(c => c.is_premium);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Empty State Trap Banner (Triggered when searching specific disease but no premium clinic exists yet) */}
        {isDiseaseSearch && !hasPremium && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-4">
            <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-blue-900">Evaluating Premium Clinics</h3>
              <p className="text-sm text-blue-800 mt-1">
                We are currently verifying the most trusted premium clinics for <strong>{searchParams.disease}</strong> in {locName}. 
                In the meantime, you can explore the standard public {deptName} clinics below.
              </p>
            </div>
          </div>
        )}

        {/* Search Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            {headerTitle}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {matchDescription}
          </p>
        </div>

        {/* Dual Layout Interactive Search Client */}
        <ClinicSearchClient 
          lang={lang}
          filteredClinics={filteredClinics}
          mapCenter={mapCenter}
        />
      </div>
    </>
  );
}
