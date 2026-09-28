'use strict';

import React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/lib/translation';
import { mockClinics } from '@/lib/supabase';
import ClinicCard from '@/components/ClinicCard';
import HomeSearch from '@/components/HomeSearch';
import { MapPin, Stethoscope } from 'lucide-react';

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
  ];

  const locations = [
    { slug: 'gangnam', name: dict.gangnam },
    { slug: 'seoul-station', name: dict['seoul-station'] },
    { slug: 'jamsil', name: dict.jamsil },
    { slug: 'incheon', name: dict.incheon },
    { slug: 'dongtan', name: dict.dongtan },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-4 text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e293b_0%,transparent_60%)]"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {dict.title}
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
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
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Locations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            Search by Location
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {locations.map((loc) => (
              <Link 
                key={loc.slug}
                href={`/clinics/urology/${loc.slug}`}
                className="text-xs font-semibold bg-slate-50 text-slate-700 py-2.5 px-4 rounded-lg border border-slate-200/60 hover:bg-amber-500 hover:text-white hover:border-amber-600 transition text-center"
              >
                {loc.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Stethoscope className="w-5 h-5 text-amber-500" />
            {dict.categories_title}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {departments.map((dept) => (
              <Link 
                key={dept.slug}
                href={`/clinics/${dept.slug}/gangnam`}
                className="text-xs font-semibold bg-slate-50 text-slate-700 py-2.5 px-4 rounded-lg border border-slate-200/60 hover:bg-amber-500 hover:text-white hover:border-amber-600 transition text-center"
              >
                {dept.name}
              </Link>
            ))}
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
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      </section>
    </div>
  );
}
