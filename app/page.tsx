'use strict';

import React from 'react';
import { SITE_URL } from '@/lib/site';

export const metadata = { title:'Find Clinics in Korea by Station, Region & Department | Korea Clinic Map', alternates: { canonical: SITE_URL } };
import Link from 'next/link';
import { getDictionary } from '@/lib/translation';
import { mockClinics } from '@/lib/supabase';
import ClinicCard from '@/components/ClinicCard';
import {clinicRegion} from '@/lib/clinic-region';
import HomeSearch from '@/components/HomeSearch';
import { MapPin, Stethoscope } from 'lucide-react';
import StationFinder from '@/components/StationFinder';
import departmentLabels from '@/lib/department-labels.json';

interface HomePageProps {
  params: any;
}

export default function HomePage({ params }: HomePageProps) {
  const dict = getDictionary('en');

  // Filter premium (Goldman) clinics to feature on the homepage
  const featuredClinics = mockClinics.filter((c) => c.is_premium);

  const departments = [
    { slug: 'urology', name: dict.urology },
    { slug: 'dentistry', name: dict.dentistry },
    { slug: 'internal-medicine', name: dict['internal-medicine'] },
    { slug: 'dermatology', name: dict.dermatology },
    { slug: 'plastic-surgery', name: dict['plastic-surgery'] },
    { slug: 'ent', name: 'ENT (Ear, Nose & Throat)' },
    { slug: 'pediatrics', name: 'Pediatrics (Children)' },
    { slug: 'ob-gyn', name: 'Obstetrics & Gynecology' },
    { slug: 'orthopedics', name: 'Orthopedics (Bones & Joints)' },
    { slug: 'ophthalmology', name: 'Ophthalmology (Eyes)' },
  ];

  const locations = [
    { slug: 'gangnam', name: 'Gangnam area' },
    { slug: 'seoul', name: 'Seoul' },
    { slug: 'busan', name: 'Busan' },
    { slug: 'daegu', name: 'Daegu' },
    { slug: 'daejeon', name: 'Daejeon' },
    { slug: 'gwangju', name: 'Gwangju' },
    { slug: 'ulsan', name: 'Ulsan' },
    { slug: 'jeju', name: 'Jeju' },
    { slug: 'jamsil', name: dict.jamsil },
    { slug: 'incheon', name: dict.incheon },
    { slug: 'dongtan', name: dict.dongtan },
  ];

  return (
    <div className="space-y-6 sm:space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-8 sm:py-20 px-4 text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e293b_0%,transparent_60%)]"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-3 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {dict.title}
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto font-medium">
            {dict.subtitle}
          </p>

          {/* Search Box */}
          <HomeSearch 
            placeholder={dict.search_placeholder} 
            btnText={dict.search_btn} 
          />
        </div>
      </section>

      {/* Grid of Browse Links */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">
        <nav aria-label="Choose how to find a clinic" className="grid grid-cols-3 gap-2">{[['station-search','By station'],['area-search','By area'],['department-search','By department']].map(([id,label])=><a key={id} href={`#${id}`} className="min-h-11 flex items-center justify-center text-center rounded-lg border bg-white px-2 py-3 text-sm font-bold hover:border-amber-500">{label}</a>)}</nav>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 id="station-search" className="browse-anchor text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Find by Station</h2>
          <p className="text-xs text-slate-500">Choose a station, then filter by distance and department.</p>
          <StationFinder />
        </div>
        
        {/* Locations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 id="area-search" className="browse-anchor text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            Find by Area
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {locations.map((loc) => (
              <Link 
                key={loc.slug}
                href={`/clinics/all/${loc.slug}`}
                className="text-xs font-semibold bg-slate-50 text-slate-700 py-2.5 px-4 rounded-lg border border-slate-200/60 hover:bg-amber-500 hover:text-white hover:border-amber-600 transition text-center"
              >
                {loc.name}
              </Link>
            ))}
          </div>
          <Link href="/areas" className="min-h-11 inline-flex items-center underline text-sm">Browse all provinces, cities and districts</Link>
        </div>

        {/* Departments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 id="department-search" className="browse-anchor text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Stethoscope className="w-5 h-5 text-amber-500" />
            {dict.categories_title}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {departments.map((dept) => (
              <Link 
                key={dept.slug}
                href={`/clinics/${dept.slug}/all`}
                className="text-xs font-semibold bg-slate-50 text-slate-700 py-2.5 px-4 rounded-lg border border-slate-200/60 hover:bg-amber-500 hover:text-white hover:border-amber-600 transition text-center"
              >
                {dept.name}
              </Link>
            ))}
          </div>
          <details className="border-t pt-2"><summary className="cursor-pointer min-h-11 py-3 text-sm font-semibold">Browse all medical departments</summary><div className="grid grid-cols-2 gap-2">{Object.entries(departmentLabels).filter(([slug])=>!['medical-clinic','general-hospital','long-term-care'].includes(slug)).map(([slug,label])=><Link key={slug} href={`/clinics/${slug}/all`} className="min-h-11 flex items-center rounded-lg border px-3 py-2 text-sm hover:border-amber-500">{label}</Link>)}</div></details>
        </div>

        </div>
      </section>

      {/* Featured Partner (Goldman) */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500">
            RECOMMENDED CLINICS
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            Goldman Urology Specialty Clinics
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Certified clinics equipped with multi-lingual support, board-certified specialists, and advanced facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredClinics.slice(0, 3).map((clinic) => (
            <ClinicCard key={clinic.id} clinic={{...clinic,address_region:clinicRegion(clinic)}} />
          ))}
        </div>
      </section>
    </div>
  );
}
