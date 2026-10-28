import {goldmanSearchMetadata,goldmanComparison,urologyComparisonForAddress,urologyAreas} from '@/lib/urology-discovery';
import {goldmanBranch} from '@/lib/goldman';
import InlineHelp from '@/components/InlineHelp';
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
import {getClinicByIdForPage} from '@/lib/public-clinic-reads';
import { getDictionary } from '@/lib/translation';
import { MapPin, Phone, Clock, Star, ShieldCheck, Info } from 'lucide-react';
import { clinicFocus, groupedDepartments } from '@/lib/clinic-evidence';
import RegistrationBadge from '@/components/RegistrationBadge';
import ClinicContact from '@/components/ClinicContact';
import {clinicName,clinicAddress,clinicPhone} from '@/lib/clinic-contact';
import {clinicRegion} from '@/lib/clinic-region';
import ClinicReturnLink from '@/components/ClinicReturnLink';
import {SaveClinic,RecordClinicVisit} from '@/components/ClinicLibrary';
import {clinicSnapshot} from '@/lib/clinic-library';
import {nearbyStation} from '@/lib/card-location';
import {stationPages} from '@/lib/stations';
import {isJamsilDong} from '@/lib/jamsil-scope';
import {searchLink} from '@/lib/search';
import ClinicConditions from '@/components/ClinicConditions';
import ClinicWeekendHours from '@/components/ClinicWeekendHours';
import conditionPilot from '@/lib/hira-condition-pilot.json';

// Generate only requested public profiles, then reuse HTML/RSC for one hour.
export const revalidate = 3600;
export function generateStaticParams(){return [];}

interface ClinicDetailProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ClinicDetailProps) {
  const clinic = await getClinicByIdForPage(params.id);
  if (!clinic) return { title: 'Clinic Not Found' };

  return {
    title: `${clinicName(clinic)} | Korea Clinic Map`,
    description: `Contact information and medical equipment details for ${clinicName(clinic)} in ${clinicRegion(clinic)?.label || 'Korea'}.`,
    ...goldmanSearchMetadata(params.id),
    alternates: {
      canonical: `${SITE_URL}${clinicPath(clinic)}`,
    }
  };
}

export default async function ClinicDetail({ params }: ClinicDetailProps) {
  const canonicalId=canonicalClinicId(params.id);
  if(canonicalId!==params.id){
    permanentRedirect(`/clinics/detail/${canonicalId}`);
  }
  const clinic = await getClinicByIdForPage(params.id);
  if (!clinic) return notFound();

  const region=clinicRegion(clinic);
  const snapshot=clinicSnapshot({...clinic,address_region:region});
  const isPremium = clinic.is_premium;
  const name=clinicName(clinic),address=clinicAddress(clinic),phone=clinicPhone(clinic.telephone);
  const pd = clinic.premium_data || {};
  const equip = clinic.public_equipment || [];
  const departments = groupedDepartments(clinic);
  const focus = clinicFocus(clinic);
  const focusSlug = clinic.department_source || isPremium ? clinic.categories?.slug || 'all' : 'all';
  const nearest=nearbyStation(clinic,stationPages);
  const branch=goldmanBranch(params.id);
  const comparison=branch?goldmanComparison[branch.id]:departments.some(d=>d.slug==='urology')?urologyComparisonForAddress(clinic.address_ko):undefined;
  
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
        
        <ClinicReturnLink region={region?.slug || 'all'}/>
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
                    <Star className="w-3 h-3" /> Partner clinic
                  </span>
                )}
                {departments.some(d=>d.specialists>0) && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100">
                    <ShieldCheck className="w-3 h-3 shrink-0" /><span className="min-w-0">Specialists reported</span>
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 break-words">{name}</h1>
              <h2 className="text-sm font-medium text-slate-500">{clinic.name_ko}</h2>
              <RegistrationBadge clinic={clinic} />
              {isPremium&&<p className="mt-2 text-xs text-slate-600">Commercial relationship · not a clinical certification.{branch?' Clinic in Korea has a consulting relationship with Goldman.':''}</p>}
            </div>
          </div>
          
          {isPremium && pd.slogan_en && (
            <details className="mt-3 text-sm"><summary className="min-h-11 cursor-pointer py-3 font-semibold">Clinic introduction</summary><p className="text-slate-700 border-l-4 border-amber-400 pl-4">
              "{pd.slogan_en}"
            </p></details>
          )}
        </section>

        <section id="visit-details" className="scroll-mt-24 bg-white rounded-2xl border border-blue-200 p-4 sm:p-6 space-y-3" aria-label="Plan your visit">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900"><MapPin aria-hidden="true" className="h-5 w-5 text-blue-700"/>Plan your visit</h2>
          <p className="text-sm font-medium select-all">{address||'Address not provided'}</p>
          <ClinicContact clinic={clinic} />
          {nearest&&<div className="rounded-lg bg-slate-50 p-3 space-y-1 text-sm"><Link href={`/clinics/${focusSlug}/${nearest.slug}`} className="inline-flex min-h-11 items-center underline font-semibold">Nearby station: {nearest.name}</Link><p>{Math.round(nearest.distance).toLocaleString()} m straight-line distance · official station coordinates</p><InlineHelp label="About this distance">Distance is measured from official station coordinates, not an exit or walking route.</InlineHelp></div>}
          <div className="flex flex-wrap items-start gap-3 border-t pt-3"><SaveClinic clinic={snapshot}/><ShareClinic name={name} url={`${SITE_URL}${clinicPath(clinic)}`}/></div>
          <Link href={clinicCorrectionLink(clinic.hira_code||String(clinic.id))} className="inline-flex min-h-11 items-center underline text-sm">Report incorrect information for this clinic</Link>
        </section>

        <nav aria-label="Clinic page sections" className="flex flex-wrap gap-2 text-sm"><a href="#visit-details" className="min-h-11 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 font-semibold text-blue-900">Contact & directions</a><a href="#clinic-information" className="min-h-11 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 font-semibold text-violet-900">Departments & clinic information</a></nav>
        <details className="rounded-2xl border bg-white p-4 sm:p-6"><summary className="min-h-11 cursor-pointer py-2 text-lg font-bold">Reported hours & care information</summary><div className="space-y-4 pt-3">
        <ClinicWeekendHours id={clinic.hira_code||params.id} name={clinic.name_ko||''} address={clinic.address_ko||''} telephone={clinic.telephone||''}/>
        <ClinicConditions ykiho={clinic.hira_code||params.id} record={(conditionPilot as Record<string,unknown>)[clinic.hira_code||params.id]}/>
        <ContextualCareGuides department={focusSlug} location={region?.slug} stage="profile"/>
        </div></details>
        {comparison&&<aside aria-label="Local urology comparison" className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2 text-sm">
          {branch&&<><p className="font-semibold">Goldman {branch.name} visit overview</p><p>{branch.address} · {branch.transit}</p><p className="text-xs text-slate-600">Partner clinic · Clinic in Korea has a consulting relationship with Goldman.</p></>}
          <a href={'/clinics/urology/'+comparison} className="min-h-11 inline-flex items-center font-semibold underline">{urologyAreas[comparison].title} →</a>
          <p>Explore other clinic records, reported specialists and contact details before choosing where to visit.</p>
        </aside>}
        {(region||nearest)&&<section aria-label="Compare clinics in this area" className="rounded-xl border bg-white p-4 space-y-3 text-sm">
          <h2 className="font-bold">Compare clinics in this area</h2>
          <nav className="flex flex-wrap gap-2" aria-label="Nearby clinic comparison">
            {region&&<Link className="min-h-11 inline-flex items-center rounded-lg border px-3 py-3 underline" href={searchLink(focusSlug,region.slug)}>Browse {focusSlug==='all'?'clinics':focus.toLowerCase()+' clinics'} in {region.label}</Link>}
            {nearest&&<Link className="min-h-11 inline-flex items-center rounded-lg border px-3 py-3 underline" href={searchLink(focusSlug,nearest.slug,{radius:1000})}>Compare near {nearest.name} · 1 km</Link>}
            {isJamsilDong(clinic.address_ko)&&departments.some(d=>d.slug==='urology')&&<Link className="min-h-11 inline-flex items-center rounded-lg border px-3 py-3 underline" href="/clinics/urology/jamsil">Compare urology clinics in Jamsil-dong</Link>}
          </nav>
          <InlineHelp label="Area or station — what’s the difference?">Area results follow address boundaries. Station results use a straight-line radius and can cross neighbourhood boundaries. Save clinics from results to compare them in <Link className="underline" href="/my-clinics">My clinics</Link>.</InlineHelp>
        </section>}

        {branch&&<details className="rounded-2xl border bg-white p-4 sm:p-6"><summary className="min-h-11 cursor-pointer py-2 text-lg font-bold">Partner visit guides & reviews</summary><div className="space-y-4 pt-3">
        <GoldmanVisitGuide clinicId={String(clinic.id)} />
        <GoldmanGoogleReviews key={String(clinic.id)} clinicId={String(clinic.id)} />
        <GoldmanCareGuide clinicId={String(clinic.id)} />

        </div></details>}

        {/* Always-visible anchors keep the full evidence table accessible. */}
        <details id="clinic-information" className="scroll-mt-24 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <summary className="min-h-11 cursor-pointer p-5 text-lg font-bold">Departments, facilities & source details</summary>
          <div className="px-5"><RegistrationBadge clinic={clinic} detailed /></div>
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
        </details>

      </div>
    </>
  );
}
