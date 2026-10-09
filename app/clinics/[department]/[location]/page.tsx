'use strict';

import React from 'react';
import { Locale, getDictionary } from '@/lib/translation';
import { getClinics } from '@/lib/supabase';
import ClinicSearchClient from '@/components/ClinicSearchClient';

interface Params {
  department: string;
  location: string;
}

interface SearchPageProps {
  params: Params;
  searchParams: { q?: string };
}

export async function generateStaticParams() {
  const departments = ['all', 'urology', 'dentistry', 'internal-medicine', 'dermatology', 'plastic-surgery'];
  const locations = ['all', 'gangnam', 'seoul-station', 'jamsil', 'incheon', 'dongtan'];
  const paramsList = [];

  for (const dept of departments) {
    for (const loc of locations) {
      paramsList.push({ department: dept, location: loc });
    }
  }
  return paramsList;
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

// Generate dynamic metadata for Programmatic SEO (AEO/GEO ranking)
export async function generateMetadata({ params: { department, location } }: SearchPageProps) {
  const lang = 'en' as Locale;
  const dict = getDictionary(lang);
  const { deptName, locName } = getNames(lang, department, location, dict);
  
  const title = lang === 'mn' 
    ? `${locName} ${deptName} эмнэлгүүд | Korea Clinic Map`
    : `${locName} ${deptName} Clinics | Korea Clinic Map`;
    
  const description = lang === 'mn'
    ? `${locName} орчимд байрлах ${deptName} эмнэлгүүдийн жагсаалт, хаяг, утасны дугаар болон цагийн хуваарь зэрэг нийтийн мэдээллийг хүргэж байна.`
    : `List of ${deptName} clinics and hospitals located in ${locName}. Find addresses, telephone numbers, and operating hours based on public healthcare data.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://koreaclinicmap.comclinics/${department}/${location}`,
    }
  };
}

export default async function SearchPage({ params: { department, location }, searchParams }: SearchPageProps) {
  const lang = "en" as any;

  const dict = getDictionary(lang);
  const allClinics = await getClinics();

  // Programmatic filtering based on URL parameters
  let filteredClinics = allClinics.filter((clinic: any) => {
    const clinicDept = clinic.category?.slug || '';
    const clinicLoc = clinic.location?.slug || '';
    
    const matchesDept = department === 'all' || clinicDept === department;
    const matchesLoc = location === 'all' || clinicLoc === location;
    
    return matchesDept && matchesLoc;
  });

  // Apply optional search query parameter filter
  const query = searchParams?.q ? decodeURIComponent(searchParams.q).trim().toLowerCase() : '';
  if (query) {
    filteredClinics = filteredClinics.filter((clinic: any) => {
      const nameMatch = 
        clinic.name_ko.toLowerCase().includes(query) ||
        clinic.name_en.toLowerCase().includes(query) ||
        clinic.name_mn.toLowerCase().includes(query);

      const addressMatch = 
        clinic.address_ko.toLowerCase().includes(query) ||
        (clinic.address_en && clinic.address_en.toLowerCase().includes(query)) ||
        (clinic.address_mn && clinic.address_mn.toLowerCase().includes(query));

      const specialtyMatch = 
        clinic.premium_data?.specialties?.some((spec: string) => spec.toLowerCase().includes(query)) || false;

      return nameMatch || addressMatch || specialtyMatch;
    });
  }

  const { deptName, locName } = getNames(lang, department, location, dict);

  // Compute map center (fallback to Seoul City Hall if empty)
  const mapCenter = filteredClinics.length > 0 
    ? { lat: filteredClinics[0].latitude, lng: filteredClinics[0].longitude }
    : { lat: 37.5665, lng: 126.9780 };

  // Render header templates localized properly
  const headerTitle = lang === 'mn'
    ? `${locName} дахь ${deptName} эмнэлэгүүд`
    : `${deptName} Clinics in ${locName}`;

  const matchDescription = lang === 'mn'
    ? `Хайлтад нийцэх ${filteredClinics.length} эмнэлэг олдлоо`
    : `${filteredClinics.length} clinics match your search criteria`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
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
  );
}
