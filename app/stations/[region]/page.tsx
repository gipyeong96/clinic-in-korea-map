import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE_URL, serializeJsonLd } from '@/lib/site';
import { stationPages } from '@/lib/stations';
import { stationRegions } from '@/lib/station-regions';

export function generateStaticParams(){return stationRegions.map(r=>({region:r.slug}));}
export function generateMetadata({params}:{params:{region:string}}){
  const r=stationRegions.find(r=>r.slug===params.region);
  if(!r)return {title:'Region not found',robots:{index:false}};
  return {title:`Clinics Near Stations in ${r.name} | Korea Clinic Map`,description:`Browse all listed stations in ${r.name} with English and Korean names. Find nearby clinics by distance and medical department.`,alternates:{canonical:`${SITE_URL}/stations/${r.slug}`}};
}
export default function StationRegionPage({params}:{params:{region:string}}){
  const r=stationRegions.find(r=>r.slug===params.region);if(!r)notFound();
  const stations=stationPages.filter(s=>r.cities.includes(s.city));
  const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{ '@type':'ListItem',position:1,name:'Home',item:SITE_URL},{'@type':'ListItem',position:2,name:'Stations',item:`${SITE_URL}/stations`},{'@type':'ListItem',position:3,name:r.name,item:`${SITE_URL}/stations/${r.slug}`}]};
  return <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(breadcrumb)}} />
    <nav aria-label="Breadcrumb" className="text-sm"><Link href="/" className="underline">Home</Link> / <Link href="/stations" className="underline">Stations</Link> / {r.name}</nav>
    <h1 className="text-3xl font-bold">Clinics near stations in {r.name}</h1>
    <p>Browse {stations.length} listed station entries. Select a station to see nearby clinics within 1 km, then adjust the radius or medical department. Regional rail and urban rail entries are shown separately where official records differ.</p>
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{stations.map(s=><li key={s.slug}><Link href={`/clinics/all/${s.slug}`} className="block h-full border rounded-lg bg-white p-4 hover:border-amber-500"><span className="block font-semibold">{s.name_en} · {s.name_ko}</span><span className="block text-xs text-slate-500 mt-1">{s.city} · {s.stations.map(l=>l.line).join(' / ')}</span></Link></li>)}</ul>
    <Link href="/stations" className="inline-block underline">Browse other regions</Link>
  </div>;
}
