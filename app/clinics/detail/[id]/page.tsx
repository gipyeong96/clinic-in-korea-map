import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClinicById } from '@/lib/supabase';
import { getDictionary } from '@/lib/translation';
import { MapPin, Phone, Clock, Star, ShieldCheck, Info } from 'lucide-react';

interface ClinicDetailProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ClinicDetailProps) {
  const clinic = await getClinicById(params.id);
  if (!clinic) return { title: 'Clinic Not Found' };

  return {
    title: `${clinic.name_en} | Korea Clinic Map`,
    description: `Contact information, operating hours, and medical equipment details for ${clinic.name_en} in ${clinic.locations?.name_en || 'Korea'}.`,
    alternates: {
      canonical: `https://koreaclinicmap.com/clinics/detail/${clinic.hira_code}`,
    }
  };
}

export default async function ClinicDetail({ params }: ClinicDetailProps) {
  const clinic = await getClinicById(params.id);
  if (!clinic) return notFound();

  const isPremium = clinic.is_premium;
  const pd = clinic.premium_data || {};
  const equip = clinic.public_equipment || [];
  
  // MedicalClinic Schema (SEO/AEO/GEO)
  const medicalClinicSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": `https://koreaclinicmap.com/clinics/detail/${clinic.hira_code}`,
    "name": clinic.name_en,
    "alternateName": clinic.name_ko,
    "medicalSpecialty": clinic.categories?.name_en,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": clinic.address_ko,
      "addressCountry": "KR"
    },
    "telephone": clinic.telephone,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": clinic.latitude,
      "longitude": clinic.longitude
    },
    "url": pd.website || `https://koreaclinicmap.com/clinics/detail/${clinic.hira_code}`
  };

  // FAQ Schema (AEO)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Where is ${clinic.name_en} located?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `It is located at ${clinic.address_ko}.`
        }
      },
      {
        "@type": "Question",
        "name": `What is the phone number for ${clinic.name_en}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `You can contact them at ${clinic.telephone}.`
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalClinicSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Breadcrumb Navigation (Semantic AEO/SEO) */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex gap-2 font-medium">
          <Link href="/" className="hover:text-amber-500">Home</Link>
          <span>›</span>
          <Link href={`/clinics/${clinic.categories?.slug || 'all'}/all`} className="hover:text-amber-500">
            {clinic.categories?.name_en || 'Clinics'}
          </Link>
          <span>›</span>
          <Link href={`/clinics/${clinic.categories?.slug || 'all'}/${clinic.locations?.slug || 'all'}`} className="hover:text-amber-500">
            {clinic.locations?.name_en || 'Area'}
          </Link>
          <span>›</span>
          <span className="text-slate-800" aria-current="page">{clinic.name_en}</span>
        </nav>

        {/* Header Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">
                  {clinic.categories?.name_en || 'Medical Clinic'}
                </span>
                {isPremium && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded">
                    <Star className="w-3 h-3" /> Premium Verified
                  </span>
                )}
                {clinic.has_specialist && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100">
                    <ShieldCheck className="w-3 h-3" /> Specialist
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-black text-slate-900 mb-1">{clinic.name_en}</h1>
              <h2 className="text-sm font-medium text-slate-500">{clinic.name_ko}</h2>
            </div>
          </div>
          
          {isPremium && pd.slogan_en && (
            <p className="mt-6 text-lg font-medium text-slate-700 italic border-l-4 border-amber-400 pl-4">
              "{pd.slogan_en}"
            </p>
          )}
        </section>

        {/* Semantic Table for AEO (AI bots easily parse tables) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Info className="w-5 h-5 text-slate-400" /> 
              Clinic Information
            </h2>
          </div>
          
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <th scope="row" className="px-6 py-4 font-semibold text-slate-700 bg-slate-50/50 w-1/3">Address</th>
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{clinic.address_ko}</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <th scope="row" className="px-6 py-4 font-semibold text-slate-700 bg-slate-50/50">Telephone</th>
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{clinic.telephone || 'Not provided'}</span>
                  </div>
                </td>
              </tr>
              {equip.length > 0 && (
                <tr className="hover:bg-slate-50 transition-colors">
                  <th scope="row" className="px-6 py-4 font-semibold text-slate-700 bg-slate-50/50">Medical Equipment</th>
                  <td className="px-6 py-4">
                    <ul className="flex flex-wrap gap-2">
                      {equip.map((eq: string, i: number) => (
                        <li key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                          {eq}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

      </div>
    </>
  );
}
