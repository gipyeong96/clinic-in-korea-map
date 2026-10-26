import HomeNearbySearch from '@/components/HomeNearbySearch';
import CareGuideCards from '@/components/CareGuideCards';
import {metadata as rootMetadata} from './layout';
import {nearbyStation} from '@/lib/card-location';
import {stationPages} from '@/lib/stations';
import {additionalGoldmanClinics} from '@/lib/goldman';
import GoldmanVisitGuide from '@/components/GoldmanVisitGuide';
import {RecentClinicsHome} from '@/components/ClinicLibrary';
'use strict';

import React from 'react';
import { SITE_URL } from '@/lib/site';

export const metadata = { verification: { ...rootMetadata.verification, other: { 'naver-site-verification': ['65fe601ba42fc61095a21a0ac4d1b5f1ac113b98','ba7b483c422d4f376bf9b476d8c9636284157f23'], 'msvalidate.01': 'F7D1898AD3213866CD50BAFD9BBA766C' } }, title:'Find Clinics in Korea by Station, Region & Department | Korea Clinic Map', alternates: { canonical: SITE_URL } };
import Link from 'next/link';
import { getDictionary } from '@/lib/translation';
import { mockClinics } from '@/lib/supabase';
import ClinicCard from '@/components/ClinicCard';
import {clinicRegion} from '@/lib/clinic-region';
import HomeSearch from '@/components/HomeSearch';
import { MapPin, Stethoscope } from 'lucide-react';
import StationFinder from '@/components/StationFinder';
import {areaBrowseLink} from '@/lib/area-navigation';
import departmentLabels from '@/lib/department-labels.json';

interface HomePageProps {
  params: any;
}

export default function HomePage({ params }: HomePageProps) {
  const dict = getDictionary('en');

  // Filter premium (Goldman) clinics to feature on the homepage
  const featuredClinics = [...mockClinics.filter((c) => c.is_premium),...additionalGoldmanClinics];

  const departments = [
    { slug: 'urology', name: dict.urology, hint: 'Urinary tract & male reproductive health' },
    { slug: 'dentistry', name: dict.dentistry, hint: 'Teeth & gums' },
    { slug: 'internal-medicine', name: dict['internal-medicine'], hint: 'Adult medical care' },
    { slug: 'dermatology', name: dict.dermatology, hint: 'Skin, hair & nails' },
    { slug: 'plastic-surgery', name: dict['plastic-surgery'], hint: 'Reconstructive & cosmetic surgery' },
    { slug: 'ent', name: 'ENT', hint: 'Ear, nose & throat' },
    { slug: 'pediatrics', name: 'Pediatrics', hint: 'Babies, children & teens' },
    { slug: 'ob-gyn', name: 'Obstetrics & Gynecology', hint: 'Pregnancy & reproductive health' },
    { slug: 'orthopedics', name: 'Orthopedics', hint: 'Bones, joints & muscles' },
    { slug: 'ophthalmology', name: 'Ophthalmology', hint: 'Eyes & vision' },
  ];

  const locations = [
    { slug: 'gangnam', name: 'Gangnam area' },
    { slug: 'seoul', name: 'Seoul' },
    { slug: 'gyeonggi', name: 'Gyeonggi' },
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
          <HomeNearbySearch/>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <nav aria-label="Choose how to find a clinic" className="grid grid-cols-3 gap-2">{[['station-search','By station'],['area-search','By area'],['department-search','By department']].map(([id,label])=><a key={id} href={`#${id}`} className="min-h-11 flex items-center justify-center text-center rounded-lg border bg-white px-2 py-3 text-sm font-bold hover:border-amber-500">{label}</a>)}</nav>
      </div>

      <RecentClinicsHome />

      {/* Grid of Browse Links */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">

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
          <p className="text-xs text-slate-500">Choose a city or province, then narrow down to a district.</p>
          <h3 className="text-sm font-bold">Cities & provinces</h3>
          <div className="grid grid-cols-2 gap-2">{locations.filter(loc=>!['gangnam','jamsil','dongtan'].includes(loc.slug)).map(loc=><Link key={loc.slug} href={`/areas/${loc.slug}`} className="min-h-11 flex items-center justify-center rounded-lg border bg-slate-50 px-3 py-2 text-xs font-semibold hover:border-amber-500">{loc.name}</Link>)}</div>
          <h3 className="text-sm font-bold">Popular areas</h3>
          <div className="flex flex-wrap gap-2">{locations.filter(loc=>['gangnam','jamsil','dongtan'].includes(loc.slug)).map(loc=><Link key={loc.slug} href={`/clinics/all/${loc.slug}`} className="min-h-11 inline-flex items-center rounded-lg border px-3 py-2 text-xs font-semibold hover:border-amber-500">{loc.name}</Link>)}</div>
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
                href={areaBrowseLink(undefined,{department:dept.slug,query:'',specialist:false})}
                className="min-h-11 min-w-0 break-words text-xs bg-slate-50 text-slate-700 py-3 px-3 rounded-lg border border-slate-200/60 hover:bg-amber-50 hover:border-amber-500 transition text-left"
              >
                <span className="block font-semibold">{dept.name}</span><span className="block mt-1 text-slate-500 leading-relaxed">{dept.hint}</span>
              </Link>
            ))}
          </div>
          <details className="border-t pt-2"><summary className="cursor-pointer min-h-11 py-3 text-sm font-semibold">Browse all medical departments</summary><div className="grid grid-cols-2 gap-2">{Object.entries(departmentLabels).filter(([slug])=>!['medical-clinic','general-hospital','long-term-care'].includes(slug)).map(([slug,label])=><Link key={slug} href={areaBrowseLink(undefined,{department:slug,query:'',specialist:false})} className="min-h-11 flex items-center rounded-lg border px-3 py-2 text-sm hover:border-amber-500">{label}</Link>)}</div></details>
        </div>

        </div>
      </section>

      <aside aria-label="Saving clinics" className="max-w-5xl mx-auto px-4"><div className="rounded-xl border bg-white p-4 text-sm text-slate-600"><p className="font-semibold text-slate-800">Save clinics on this device — no sign-up needed.</p><p className="mt-1">Choose “Save clinic” on a clinic card or profile, then find it in <Link href="/my-clinics" className="underline inline-flex min-h-11 items-center">My clinics</Link>. Saved clinics stay in this browser. Select two or three in My clinics to compare their directory information.</p></div></aside>
      <section aria-labelledby="care-guides-heading" className="max-w-5xl mx-auto px-4 space-y-4"><h2 id="care-guides-heading" className="text-2xl font-bold">Guides to finding care in Korea</h2><p className="text-slate-600">Checklists and explanations for finding care across Korea.</p><CareGuideCards/><Link href="/guides" className="min-h-11 inline-flex items-center underline">Browse care guides</Link></section>
    </div>
  );
}
