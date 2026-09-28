'use strict';

import React from 'react';
import { notFound } from 'next/navigation';
import { Locale } from '@/lib/translation';
import { getClinicById, mockClinics } from '@/lib/supabase';
import PremiumDetail from '@/components/PremiumDetail';
import StandardDetail from '@/components/StandardDetail';

interface DetailPageProps {
  params: {
    lang: Locale;
    id: string;
  };
}

export async function generateStaticParams() {
  const paramsList = [];
  for (const lang of ['en', 'mn']) {
    for (const clinic of mockClinics) {
      paramsList.push({ lang, id: clinic.id });
    }
  }
  return paramsList;
}

// Generate clinic-specific SEO, AEO, and GEO tags
export async function generateMetadata({ params: { lang, id } }: DetailPageProps) {
  const clinic = await getClinicById(id);
  if (!clinic) return {};

  const name = lang === 'mn' ? clinic.name_mn : clinic.name_en;
  const address = lang === 'mn' ? clinic.address_mn || clinic.address_ko : clinic.address_en || clinic.address_ko;
  const category = clinic.category?.name_en || 'Clinic';

  const title = `${name} | Foreigner-Friendly ${category} in Korea`;
  const description = `Consult at ${name} located in ${address}. View opening hours, coordinates, contact info, and available services.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://koreaclinicmap.comclinics/detail/${id}`,
    },
    // Injection of GEO metadata for local and generative engine optimization (GEO)
    other: {
      'geo.position': `${clinic.latitude};${clinic.longitude}`,
      'geo.placename': address,
      'ICBM': `${clinic.latitude}, ${clinic.longitude}`,
    }
  };
}

export default async function DetailPage({ params: { lang, id } }: DetailPageProps) {
  const lang = "en" as const;

  const clinic = await getClinicById(id);
  if (!clinic) {
    notFound();
  }

  // Render localized Premium layout for client clinics (e.g., Goldman)
  if (clinic.is_premium) {
    return <PremiumDetail lang={lang} clinic={clinic} />;
  }

  // Render plain public HIRA info layout for normal clinics
  return <StandardDetail lang={lang} clinic={clinic} />;
}
