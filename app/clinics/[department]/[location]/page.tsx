import React from 'react';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/translation';
import { getClinics } from '@/lib/supabase';
import { SITE_URL, clinicPath, serializeJsonLd } from '@/lib/site';
import ClinicSearchClient from '@/components/ClinicSearchClient';

export const dynamic = 'force-dynamic';
const departments = ['all', 'urology', 'dentistry', 'internal-medicine', 'dermatology', 'plastic-surgery'];
interface Props {
  params: { department: string; location: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
function text(value: string | string[] | undefined) { return typeof value === 'string' ? value.trim().slice(0, 200) : ''; }
function names(department: string, location: string) {
  const dict = getDictionary('en');
  return {
    dept: department === 'all' ? 'Medical' : (dict as Record<string, string>)[department] || department,
    loc: location === 'all' ? 'Korea' : (dict as Record<string, string>)[location] || location.replace(/-/g, ' '),
  };
}
export function generateMetadata({ params, searchParams }: Props) {
  const { dept, loc } = names(params.department, params.location);
  return {
    title: `${dept} Clinics in ${loc} | Korea Clinic Map`,
    description: `Browse ${dept.toLowerCase()} clinics in ${loc}. View addresses and contact details. Contact clinics to confirm language support and services.`,
    alternates: { canonical: `${SITE_URL}/clinics/${params.department}/${params.location}` },
    robots: Object.keys(searchParams).length ? { index: false, follow: true } : undefined,
  };
}
export default async function SearchPage({ params, searchParams }: Props) {
  if (!departments.includes(params.department)) notFound();
  const query = text(searchParams.q);
  const specialist = searchParams.specialist === '1';
  let clinics: any[] = [];
  let failed = false;
  try {
    clinics = await getClinics({ categorySlug: params.department, locationSlug: params.location, query, specialist, limit: 100 });
  } catch { failed = true; }
  // Collapse repeated imported profiles in the displayed batch without modifying source data.
  const seen = new Set<string>();
  const filteredClinics = clinics.filter(clinic => {
    const key = JSON.stringify([clinic.name_ko, clinic.address_ko?.replace(/\s/g, ''), clinic.telephone?.replace(/[^0-9]/g, '')]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const { dept, loc } = names(params.department, params.location);
  const mapCenter = filteredClinics.length ? { lat: filteredClinics[0].latitude, lng: filteredClinics[0].longitude } : { lat: 37.5665, lng: 126.9780 };
  const schema = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    itemListElement: filteredClinics.map((clinic, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${clinicPath(clinic)}` })),
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-black">{dept} Clinics in {loc}</h1>
      <form action={`/clinics/${params.department}/${params.location}`} method="get" className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <label className="flex-1 min-w-[180px] text-sm font-semibold">Clinic name or address
          <input name="q" defaultValue={query} maxLength={200} className="block border rounded-lg px-3 py-2 w-full mt-1" placeholder="Search names or addresses" />
        </label>
        <label className="text-sm flex gap-2 py-2 items-center"><input type="checkbox" name="specialist" value="1" defaultChecked={specialist} /> Specialist recorded</label>
        <button className="bg-slate-800 text-white rounded-lg px-4 py-2">Search</button>
      </form>
      <nav aria-label="Browse medical departments" className="flex flex-wrap gap-3 text-sm">
        {departments.map(dept => <a key={dept} aria-current={dept === params.department ? 'page' : undefined} className="underline p-2" href={`/clinics/${dept}/${params.location}`}>{dept === 'all' ? 'All departments' : names(dept, 'all').dept}</a>)}
        <a href="/" className="underline p-2">Browse locations</a>
      </nav>
      <p className="text-sm text-slate-500" role={failed ? 'alert' : 'status'}>
        {failed ? 'Clinic information is temporarily unavailable. Please try again later.' : `Showing ${filteredClinics.length} clinic profiles${clinics.length === 100 ? ' from the first 100 matching records. Narrow your search for more specific results.' : '.'}`}
      </p>
      <p className="text-xs text-slate-500">Specialist status reflects imported records and may concern a different department.</p>
      {!failed && <ClinicSearchClient lang="en" filteredClinics={filteredClinics} mapCenter={mapCenter} />}
    </div>
  </>;
}
