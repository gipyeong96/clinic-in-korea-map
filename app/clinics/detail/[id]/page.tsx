import ContextualCareGuides from '@/components/ContextualCareGuides';
import ShareClinic from '@/components/ShareClinic';
import GoldmanGoogleReviews from '@/components/GoldmanGoogleReviews';
import GoldmanCareGuide from '@/components/GoldmanCareGuide';
import {clinicCorrectionLink} from '@/lib/feedback';
import GoldmanVisitGuide from '@/components/GoldmanVisitGuide';
import React from 'react';
import { SITE_URL, clinicPath, serializeJsonLd, canonicalClinicId } from '@/lib/site';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getClinicById } from '@/lib/supabase';
import { getDictionary } from '@/lib/translation';
import { MapPin, Phone, Clock, Star, ShieldCheck, Info } from 'lucide-react';
import { clinicFocus, groupedDepartments } from '@/lib/clinic-evidence';
import RegistrationBadge from '@/components/RegistrationBadge';
import ClinicContact from '@/components/ClinicContact';
import {clinicName,clinicAddress,clinicPhone} from '@/lib/clinic-contact';
import {clinicRegion} from '@/lib/clinic-region';
import {searchReturnPath} from '@/lib/detail-navigation';
import {SaveClinic,RecordClinicVisit} from '@/components/ClinicLibrary';
import {clinicSnapshot} from '@/lib/clinic-library';
import {nearbyStation} from '@/lib/card-location';
import {stationPages} from '@/lib/stations';
import {isJamsilDong} from '@/lib/jamsil-scope';
import {searchLink} from '@/lib/search';
import ClinicConditions from '@/components/ClinicConditions';
import conditionPilot from '@/lib/hira-condition-pilot.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ClinicDetailProps {
  params: { id: string };
  searchParams: {returnTo?: string | string[]};
}

export async function generateMetadata({ params }: ClinicDetailProps) {
  const clinic = await getClinicById(params.id);
  if (!clinic) return { title: 'Clinic Not Found' };

  return {
    title: `${clinicName(clinic)} | Korea Clinic Map`,
    description: `Contact information and medical equipment details for ${clinicName(clinic)} in ${clinicRegion(clinic)?.label || 'Korea'}.`,
    alternates: {
      canonical: `${SITE_URL}${clinicPath(clinic)}`,
    }
  };
}

export default async function ClinicDetail({ params, searchParams }: ClinicDetailProps) {
  const canonicalId=canonicalClinicId(params.id);
  if(canonicalId!==params.id){
    const back=searchReturnPath(searchParams.returnTo);
    permanentRedirect(`/clinics/detail/${canonicalId}${back?'?'+new URLSearchParams({returnTo:back}):''}`);
  }
  const clinic = await getClinicById(params.id);
  if (!clinic) return notFound();

  const region=clinicRegion(clinic);
  const snapshot=clinicSnapshot({...clinic,address_region:region});
  const returnTo=searchReturnPath(searchParams.returnTo);
  const isPremium = clinic.is_premium;
  const name=clinicName(clinic),address=clinicAddress(clinic),phone=clinicPhone(clinic.telephone);
  const pd = clinic.premium_data || {};
  const equip = clinic.public_equipment || [];
  const departments = groupedDepartments(clinic);
  const focus = clinicFocus(clinic);
  const focusSlug = clinic.department_source || isPremium ? clinic.categories?.slug || 'all' : 'all';
  const nearest=nearbyStation(clinic,stationPages);
  
  // MedicalClinic Schema (SEO/AEO/GEO)
  const medicalClinicSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": `${SITE_URL}${clinicPath(clinic)}`,
    "name": name,
    "alternateName": clinic.name_ko,
    "medicalSpecialty": departments.length ? departments.map(d=>d.name) : isPremium ? focus : undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": clinic.address_ko,
      "addressCountry": "KR"
    },
    "telephone": phone.href?phone.display:undefined,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": clinic.latitude,
      "longitude": clinic.longitude
    },
    "url": pd.website || `${SITE_URL}${clinicPath(clinic)}`
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
          "text": phone.href?`You can contact them at ${phone.display}.`:'A full telephone number is not provided. Confirm the number before calling.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(medicalClinicSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 min-w-0 break-words">
        <RecordClinicVisit clinic={snapshot}/>
        
        <Link href={returnTo || `/clinics/all/${region?.slug || 'all'}`} className="min-h-11 inline-flex items-center rounded-lg border bg-white px-4 py-2 text-sm font-semibold">{returnTo?'← Back to search results':'Browse clinics in this area'}</Link>
        {/* Breadcrumb Navigation (Semantic AEO/SEO) */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex flex-wrap gap-2 font-medium">
          <Link href="/" className="hover:text-amber-500">Home</Link>
          <span>›</span>
          <Link href={`/clinics/${focusSlug}/all`} className="hover:text-amber-500">
            {focus}
          </Link>
          <span>›</span>
          <Link href={`/clinics/${focusSlug}/${region?.slug || 'all'}`} className="hover:text-amber-500">
            {region?.label || 'All areas'}
          </Link>
          <span>›</span>
          <span className="text-slate-800" aria-current="page">{clinic.name_en}</span>
        </nav>

        {/* Header Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start min-w-0">
            <div className="min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">
                  {focus}
                </span>
                {isPremium && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded">
                    <Star className="w-3 h-3" /> Premium Verified
                  </span>
                )}
                {departments.some(d=>d.specialists>0) && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100">
                    <ShieldCheck className="w-3 h-3 shrink-0" /><span className="min-w-0">Specialists reported — see departments below</span>
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 break-words">{name}</h1>
              <h2 className="text-sm font-medium text-slate-500">{clinic.name_ko}</h2>
              <RegistrationBadge clinic={clinic} detailed />
            </div>
          </div>
          
          {isPremium && pd.slogan_en && (
            <p className="mt-6 text-lg font-medium text-slate-700 italic border-l-4 border-amber-400 pl-4">
              "{pd.slogan_en}"
            </p>
          )}
        </section>

        <section className="bg-white rounded-xl border p-4 space-y-3" aria-label="Plan your visit">
          <SaveClinic clinic={snapshot}/>
          <p className="text-sm font-medium select-all">{address||'Address not provided'}</p>
          {nearest&&<div className="rounded-lg bg-slate-50 p-3 space-y-1 text-sm"><Link href={`/clinics/${focusSlug}/${nearest.slug}`} className="inline-flex min-h-11 items-center underline font-semibold">Nearby station: {nearest.name}</Link><p>{Math.round(nearest.distance).toLocaleString()} m straight-line distance · official station coordinates</p><p className="text-xs text-slate-500">Distance is measured from the station coordinates, not an exit or walking route. <Link className="underline" href={`/clinics/${focusSlug}/${nearest.slug}`}>Find clinics near this station</Link>.</p></div>}
          <ClinicContact clinic={clinic} />
          <ShareClinic name={name} url={`${SITE_URL}${clinicPath(clinic)}`}/>
          <Link href={clinicCorrectionLink(clinic.hira_code||String(clinic.id))} className="inline-flex min-h-11 items-center underline text-sm">Report incorrect information for this clinic</Link>
        </section>

        <ClinicConditions ykiho={clinic.hira_code||params.id} record={(conditionPilot as Record<string,unknown>)[clinic.hira_code||params.id]}/>
        <ContextualCareGuides department={focusSlug} location={region?.slug} stage="profile"/>
        {(region||nearest)&&<section aria-label="Compare clinics in this area" className="rounded-xl border bg-white p-4 space-y-3 text-sm">
          <h2 className="font-bold">Compare clinics in this area</h2>
          <nav className="flex flex-wrap gap-2" aria-label="Nearby clinic comparison">
            {region&&<Link className="min-h-11 inline-flex items-center rounded-lg border px-3 py-3 underline" href={searchLink(focusSlug,region.slug)}>Browse {focusSlug==='all'?'clinics':focus.toLowerCase()+' clinics'} in {region.label}</Link>}
            {nearest&&<Link className="min-h-11 inline-flex items-center rounded-lg border px-3 py-3 underline" href={searchLink(focusSlug,nearest.slug,{radius:1000})}>Compare near {nearest.name} · 1 km</Link>}
            {isJamsilDong(clinic.address_ko)&&departments.some(d=>d.slug==='urology')&&<Link className="min-h-11 inline-flex items-center rounded-lg border px-3 py-3 underline" href="/clinics/urology/jamsil">Compare urology clinics in Jamsil-dong</Link>}
          </nav>
          <p>Area results follow address boundaries. Station results use a straight-line radius and can cross neighbourhood boundaries. Save clinics from results to compare them in <Link className="underline" href="/my-clinics">My clinics</Link>.</p>
        </section>}

        <GoldmanVisitGuide clinicId={String(clinic.id)} />
        <GoldmanGoogleReviews key={String(clinic.id)} clinicId={String(clinic.id)} />
        <GoldmanCareGuide clinicId={String(clinic.id)} />

        {/* Semantic Table for AEO (AI bots easily parse tables) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Info className="w-5 h-5 text-slate-400" /> 
              Clinic Information
            </h2>
          </div>
          
          <table className="clinic-info-table w-full text-sm text-left">
            <tbody className="divide-y divide-slate-100">
              {departments.length>0 && <tr><th scope="row" className="px-6 py-4 font-semibold text-slate-700 bg-slate-50/50">Reported departments</th><td className="px-6 py-4"><ul className="space-y-2">{departments.map(d=><li key={d.slug}><span className="font-medium">{d.name}</span><span className="text-slate-500"> · {d.specialists} specialist{d.specialists===1?'':'s'} recorded</span></li>)}</ul><p className="mt-3 text-xs text-slate-500">Clinic focus is a directory classification; reported departments and specialist counts are listed separately.</p>{clinic.department_source?.provider==='HIRA' && <p className="mt-2 text-xs text-slate-500"><a className="underline" href="https://opendata.hira.or.kr/op/opc/selectOpenData.do?sno=11925" target="_blank" rel="noreferrer">HIRA official data</a> · As of {clinic.department_source.as_of} · Checked {clinic.department_source.checked_at}</p>}</td></tr>}
              <tr className="hover:bg-slate-50 transition-colors">
                <th scope="row" className="px-6 py-4 font-semibold text-slate-700 bg-slate-50/50 w-1/3">Address</th>
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="select-all">{address||'Not provided'}</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <th scope="row" className="px-6 py-4 font-semibold text-slate-700 bg-slate-50/50">Telephone</th>
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    {phone.href?<a className="underline min-h-11 inline-flex items-center" href={phone.href}>{phone.display}</a>:<span>{phone.display||'Not provided'}</span>}
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
