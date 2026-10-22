'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {searchLink} from '@/lib/search';
import { stationPages } from '@/lib/stations';
import { featuredStationSlugs } from '@/lib/featured-stations';

function regionFor(city: string) {
  if (['Seoul', 'Gyeonggi'].includes(city)) return 'Seoul · Incheon · Gyeonggi';
  if (['Busan', 'Ulsan'].includes(city)) return 'Busan · Ulsan · Gimhae';
  return city;
}

export default function StationFinder({department='all',searchOptions={},compact=false}:{department?:string;searchOptions?:{query?:string;specialist?:boolean;registered?:boolean;radius?:number};compact?:boolean}) {
  const [city, setCity] = useState('');
  const [line, setLine] = useState('');
  const [query, setQuery] = useState('');
  const cities = Array.from(new Set(stationPages.map(s => regionFor(s.city)))).sort();
  const lines = Array.from(new Set(stationPages.filter(s => !city || regionFor(s.city) === city).flatMap(s => s.stations.map(l => l.line)))).sort();
  const matches = useMemo(() => stationPages.filter(s => (!city || regionFor(s.city) === city) && (!line || s.stations.some(l => l.line === line)) && `${s.name_en} ${s.name_ko} ${s.slug==='station-86b835f49957a6'?'Hongdae 홍대':''}`.toLowerCase().replace(/\s/g, '').includes(query.toLowerCase().replace(/\s/g, ''))), [city, line, query]);
  const featured=featuredStationSlugs.map(slug=>stationPages.find(s=>s.slug===slug)!);
  const hasFilter=Boolean(city||line||query.trim());
  return <div className="space-y-4">
    {!compact&&<><p className="text-xs text-slate-500">Major stations · Quick links to transport hubs and city centres.</p>
    <div className="grid grid-cols-2 gap-2" aria-label="Major station shortcuts">{featured.map(s=><Link key={s.slug} href={searchLink(department,s.slug,searchOptions)} className="min-h-11 border rounded-lg p-3 hover:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500"><span className="block font-semibold text-sm">{s.name_en}</span><span className="block text-xs text-slate-500">{s.name_ko} · {regionFor(s.city)}</span></Link>)}</div></>}
    <details open={compact||undefined} className="rounded-lg border p-3">
    <summary className="cursor-pointer min-h-11 py-3 font-semibold text-sm list-item list-inside">Search all {stationPages.length.toLocaleString()} stations</summary>
    <div className="space-y-4 pt-3">
    <div className="grid sm:grid-cols-2 gap-3">
      <label className="text-sm font-semibold">City / region<select value={city} onChange={e => {setCity(e.target.value); setLine('');}} className="block w-full border rounded-lg p-3 mt-1"><option value="">All regions</option>{cities.map(c => <option key={c}>{c}</option>)}</select></label>
      <label className="text-sm font-semibold">Line<select value={line} onChange={e => setLine(e.target.value)} className="block w-full border rounded-lg p-3 mt-1"><option value="">All lines</option>{lines.map(l => <option key={l}>{l}</option>)}</select></label>
    </div>
    <label className="block text-sm font-semibold">Station name<input value={query} onChange={e => setQuery(e.target.value)} placeholder="English or 한국어" className="block w-full border rounded-lg p-3 mt-1" /></label>
    <p role="status" className="text-xs text-slate-500">{hasFilter?`${matches.length} station${matches.length===1?'':'s'} · Choose a station to find nearby clinics.`:'Select a region or enter a station name to see matches.'}</p>
    {hasFilter&&<div className="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">{matches.slice(0, 100).map(s => <Link key={s.slug} href={searchLink(department,s.slug,searchOptions)} className="border rounded-lg p-3 hover:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500"><span className="block font-semibold text-sm">{s.name_en} <span className="font-normal">· {s.name_ko}</span></span><span className="block text-xs text-slate-500">{s.city} · {s.stations.map(l => l.line).join(' / ')}</span></Link>)}</div>}
    {hasFilter&&matches.length > 100 && <p className="text-xs text-slate-500">Showing the first 100. Select a region or enter a station name to narrow your search.</p>}
    {hasFilter&&!matches.length && <p className="text-sm">No matching station in the available official data. Try another name or <Link className="underline" href="/clinics/all/all">search clinics by address</Link>.</p>}
    </div></details>
    {!compact&&<Link href="/stations" className="inline-block min-h-11 py-3 underline text-sm">Browse stations by region</Link>}
  </div>;
}
