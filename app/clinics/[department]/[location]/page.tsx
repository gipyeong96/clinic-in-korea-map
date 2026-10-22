import {uniqueClinicProfiles} from '@/lib/site';
import ResultDepartmentPicker from '@/components/ResultDepartmentPicker';
import StationFinder from '@/components/StationFinder';
import {nearbyStation} from '@/lib/card-location';
import {stationPages} from '@/lib/stations';
import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { extractRegion } from '@/lib/regions';
import { searchLink,hasNearMeIntent,homeSearchPath,nearbySearchLink } from '@/lib/search';
import { PAGE_SIZE, MAX_PAGE, searchPage } from '@/lib/pagination';
import { matchRegions,regionLabel } from '@/lib/national-regions';
import { searchRecovery } from '@/lib/search-recovery';
import {areaBrowseLink} from '@/lib/area-navigation';
import {activeFilters} from '@/lib/active-filters';
import { getDictionary } from '@/lib/translation';
import { getClinics } from '@/lib/supabase';
import { SITE_URL, clinicPath, serializeJsonLd } from '@/lib/site';
import ClinicSearchClient from '@/components/ClinicSearchClient';
import {clinicRegion} from '@/lib/clinic-region';
import { stationForSlug, searchRadius } from '@/lib/stations';
import departmentLabels from '@/lib/department-labels.json';

export const dynamic = 'force-dynamic';
const departments = ['all', 'urology', 'dentistry', 'internal-medicine', 'dermatology', 'plastic-surgery'];
const supportedDepartments = new Set([...departments,...Object.keys(departmentLabels),'medical-clinic','general-hospital','long-term-care']);
interface Props {
  params: { department: string; location: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
function text(value: string | string[] | undefined) { return typeof value === 'string' ? value.trim().slice(0, 200) : ''; }
function names(department: string, location: string) {
  const dict = getDictionary('en');
  return {
    dept: department === 'all' ? 'Medical' : (departmentLabels as Record<string,string>)[department] || (dict as Record<string, string>)[department] || department,
    loc: regionLabel(location) || (stationForSlug(location) ? `${stationForSlug(location)!.name_en}, ${stationForSlug(location)!.city}` : (location === 'gangnam' ? 'Gangnam area (Gangnam-gu & Seocho-gu)' : location === 'all' ? 'Korea' : (dict as Record<string, string>)[location] || location.replace(/-/g, ' ').replace(/\b\w/g,c=>c.toUpperCase()))),
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
  if (!supportedDepartments.has(params.department)) notFound();
  const query = text(searchParams.q);
  const specialist = searchParams.specialist === '1';
  const registered = searchParams.registered === '1';
  const station = stationForSlug(params.location);
  const radius = searchRadius(searchParams.radius);
  if(hasNearMeIntent(query)){
    const parsed=new URL(homeSearchPath(query),SITE_URL);
    redirect(nearbySearchLink(params.department==='all'?(parsed.searchParams.get('department')||'all'):params.department,{query:parsed.searchParams.get('q')||'',specialist,registered,radius:station?radius:undefined}));
  }
  const page=searchPage(searchParams.page);
  const offset=(page-1)*PAGE_SIZE;
  const regionMatches=params.location==='all'?matchRegions(query):null;
  if(regionMatches&&regionMatches.options.length>1)return <div className="max-w-3xl mx-auto p-4 py-8 space-y-5"><h1 className="text-2xl font-bold">Choose a region</h1><p>More than one region matches “{query}”. Select the province and city you mean.</p><nav aria-label="Matching regions" className="grid sm:grid-cols-2 gap-3">{regionMatches.options.map(option=><a key={option.slug} className="min-h-11 p-4 rounded-lg border bg-white break-words font-semibold" href={searchLink(params.department,option.slug,{query:regionMatches.query,specialist,registered})}>{option.label}</a>)}</nav><a className="inline-block min-h-11 py-3 underline" href="/areas">Browse all regions</a></div>;
  const region=params.location==='all'?extractRegion(query):null;
  if(region)redirect(searchLink(params.department,region.slug,{query:region.query,specialist,registered,page}));
  let clinics: any[] = [];
  let failed = false;
  try {
    clinics = await getClinics({ categorySlug: params.department, locationSlug: params.location, query, specialist, registered, limit: PAGE_SIZE+1, radius, offset });
  } catch { failed = true; }
  // Collapse repeated imported profiles in the displayed batch without modifying source data.
  const seen = new Set<string>();
  const hasNext=clinics.length>PAGE_SIZE;
  const filteredClinics = uniqueClinicProfiles(clinics.slice(0,PAGE_SIZE).filter(clinic => {
    const key = JSON.stringify([clinic.name_ko, clinic.address_ko?.replace(/\s/g, ''), clinic.telephone?.replace(/[^0-9]/g, '')]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }));
  const { dept, loc } = names(params.department, params.location);
  const mapCenter = station ? { lat: station.stations[0].latitude, lng: station.stations[0].longitude } : filteredClinics.length ? { lat: filteredClinics[0].latitude, lng: filteredClinics[0].longitude } : { lat: 37.5665, lng: 126.9780 };
  const currentFilters=activeFilters({department:params.department,location:params.location,query,specialist,registered,radius:station?radius:undefined,departmentLabel:dept,locationLabel:loc});
  const schema = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    itemListElement: filteredClinics.map((clinic, i) => ({ '@type': 'ListItem', position: offset+i + 1, url: `${SITE_URL}${clinicPath(clinic)}` })),
  };
  const pagination=<nav aria-label="Clinic result pages" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-3 text-sm">
    {page>1?<a rel="prev" className="min-h-11 inline-flex items-center px-4 rounded-lg border font-semibold" href={searchLink(params.department,params.location,{query,specialist,registered,radius:station?radius:undefined,page:page-1})}>Previous page</a>:<span />}
    <span aria-current="page">Page {page}</span>
    {hasNext&&page<MAX_PAGE?<a rel="next" className="min-h-11 inline-flex items-center px-4 rounded-lg bg-slate-900 text-white font-semibold" href={searchLink(params.department,params.location,{query,specialist,registered,radius:station?radius:undefined,page:page+1})}>Next page</a>:<span />}
  </nav>;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    <div className="max-w-6xl mx-auto px-4 py-5 space-y-3 sm:py-8 sm:space-y-6">
      <h1 className="text-2xl md:text-3xl font-black">{station ? `${params.department === 'all' ? 'Clinics' : `${dept} Clinics`} near ${station.name_en}` : `${dept} Clinics in ${loc}`}</h1>
      {station && <div className="space-y-2 text-sm text-slate-600">
        <p>{station.name_ko} · Within {radius.toLocaleString()} m · Nearest first</p>
        <details><summary className="cursor-pointer underline">Station and distance details</summary><div className="space-y-2 py-2"><p>{station.city} · {station.stations.map(s => s.line).join(' / ')}</p>
        <p>Within {radius.toLocaleString()} m · Nearest first · Straight-line distance, not walking distance. For interchanges, the nearest listed line coordinate is used.</p>
        <details className="text-xs"><summary className="cursor-pointer underline">Official station sources and dates</summary><div className="space-y-1 py-2">{station.stations.map(s => <p key={s.id}>{s.line} · <a className="underline" href={s.source_url} target="_blank" rel="noreferrer">Official source</a> · Source record: {s.source_date}</p>)}<p>These are dated records, not a live timetable. Routes and train services may change. Source dates may be dataset or portal update dates.</p></div></details>
        </div></details>
        <details id="change-station" className="scroll-mt-24 rounded-xl border bg-white p-3"><summary className="cursor-pointer min-h-11 py-3 font-semibold">Choose another station</summary><p className="pb-3">Your department, radius and filters stay selected. Choose a region or search by station name.</p><StationFinder compact department={params.department} searchOptions={{query,specialist,registered,radius}} /></details>
      </div>}
      <form action={`/clinics/${params.department}/${params.location}`} method="get" className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <label className="flex-1 min-w-[180px] text-sm font-semibold">Clinic name or address
          <input name="q" defaultValue={query} maxLength={200} className="block border rounded-lg px-3 py-2 w-full mt-1" placeholder="Search names or addresses" />
        </label>
        {station && <label className="text-sm font-semibold">Radius<select id="search-radius" name="radius" defaultValue={String(radius)} className="scroll-mt-28 block border rounded-lg px-3 py-2 mt-1"><option value="500">500 m</option><option value="1000">1 km</option><option value="2000">2 km</option></select></label>}
        <fieldset className="basis-full flex flex-wrap gap-x-5 gap-y-2"><legend className="text-sm font-semibold mb-1">Filter clinics</legend><label className="text-sm flex gap-2 min-h-11 items-center"><input type="checkbox" name="specialist" value="1" defaultChecked={specialist} /> {params.department==='all' ? 'Specialists reported' : `${dept} specialist reported`}</label><label className="text-sm flex gap-2 min-h-11 items-center"><input type="checkbox" name="registered" value="1" defaultChecked={registered} /> Registered for international patients</label><p className="basis-full text-xs text-slate-500">Select either or both. Registration is from the official KHIDI registry and does not confirm English or interpretation support.</p></fieldset>
        <button className="bg-slate-800 text-white rounded-lg px-4 py-2">Search</button>
        <button type="submit" formAction="/nearby" name="department" value={params.department} className="min-h-11 rounded-lg border border-slate-800 px-4 py-2 text-sm font-semibold">Find clinics near me</button>
        <p className="basis-full text-xs text-slate-500">Use your current location with these search options. Location access starts only when you choose “Use my location” on the next screen.</p>
      </form>
      {currentFilters.filters.length>0&&<nav aria-label="Active search filters" className="flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold">Your search:</span>{currentFilters.filters.map(filter=><a key={filter.action} href={filter.href} aria-label={`${filter.action}: ${filter.label}`} className="min-h-11 inline-flex max-w-full items-center gap-2 rounded-full border bg-white px-4 py-2 break-words"><span className="min-w-0">{filter.label}</span><span aria-hidden="true">{filter.action==='Change radius'?'↕':'×'}</span></a>)}<a href={currentFilters.clear} className="min-h-11 inline-flex items-center px-3 underline">Clear all filters</a></nav>}
      <ResultDepartmentPicker department={params.department} location={params.location} options={{query,specialist,registered,radius:station?radius:undefined}} />
      <a href={areaBrowseLink(undefined,{department:params.department,query,specialist,registered})} className="inline-flex min-h-11 items-center underline text-sm">Choose area</a>
      <p className="text-sm text-slate-500" role={failed ? 'alert' : 'status'}>
        {failed ? 'Clinic information is temporarily unavailable. Please try again later.' : `Page ${page} · ${filteredClinics.length} clinic profiles on this page.${!filteredClinics.length&&page>1?' No further results. Use Previous page or change your search.':''}`}
      </p>
      <details className="text-xs text-slate-500"><summary className="cursor-pointer underline">About these results</summary><p className="pt-2">Results use HIRA-reported departments. A reported department does not necessarily have a specialist. Clinic focus and full department details are shown separately.</p></details>
      {failed&&<a className="inline-flex min-h-11 items-center px-4 rounded-lg border bg-white font-semibold" href={searchLink(params.department,params.location,{query,specialist,registered,radius:station?radius:undefined,page})}>Try again</a>}
      {!failed&&!filteredClinics.length&&<section aria-label="Search suggestions" className="rounded-xl border bg-white p-5 space-y-4"><h2 className="text-lg font-bold">{page>1?'Continue your search':'Try a broader search'}</h2><p className="text-sm text-slate-600">{page>1?'There are no clinic profiles on this page. Return to the first page or adjust your search.':'No clinic profiles matched this search. Adjust one filter below, or choose another location.'}</p><nav aria-label="Broaden your search" className="flex flex-wrap gap-3">{searchRecovery({department:params.department,location:params.location,query,specialist,registered,radius:station?radius:undefined,page}).map(link=><a key={link.label} href={link.href} className="min-h-11 inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold">{link.label}</a>)}</nav></section>}
      {!failed&&(page>1||!filteredClinics.length)&&pagination}
      {!failed&&filteredClinics.length>0 && <ClinicSearchClient returnTo={searchLink(params.department,params.location,{query,specialist,registered,radius:station?radius:undefined,page})} lang="en" filteredClinics={filteredClinics.map(clinic=>({...clinic,address_region:clinicRegion(clinic),card_station:nearbyStation(clinic,stationPages)}))} mapCenter={mapCenter} selectedDepartment={params.department} />}
      {!failed&&filteredClinics.length>0&&pagination}
    </div>
  </>;
}
