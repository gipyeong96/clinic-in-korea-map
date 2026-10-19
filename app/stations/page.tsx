import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { stationPages } from '@/lib/stations';
import { stationRegions } from '@/lib/station-regions';

export const metadata = {
  title:'Find Clinics Near Railway Stations Across Korea | Korea Clinic Map',
  description:'Browse Korean railway stations by region, including Seoul, Busan, Daegu, Daejeon and Gwangju. Find nearby clinics by department and distance.',
  alternates:{canonical:`${SITE_URL}/stations`},
};
export default function StationsPage(){
  return <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
    <nav aria-label="Breadcrumb" className="text-sm"><Link href="/" className="underline">Home</Link> / Stations</nav>
    <h1 className="text-3xl font-bold">Find clinics near stations across Korea</h1>
    <p>Choose a region to browse all listed stations, then find clinics within 500 m, 1 km or 2 km. Distances are straight-line measurements from official station coordinates.</p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{stationRegions.map(r=><Link key={r.slug} href={`/stations/${r.slug}`} className="border rounded-xl p-5 bg-white hover:border-amber-500"><h2 className="font-bold">{r.name}</h2><p className="text-sm text-slate-500">{stationPages.filter(s=>r.cities.includes(s.city)).length} station entries</p></Link>)}</div>
    <p className="text-sm text-slate-600">The directory uses dated official records. Stations without usable coordinates are excluded. Regional rail listings do not confirm current train services.</p>
    <p>Visiting Jeju? <Link className="underline" href="/clinics/all/jeju">Browse clinics in Jeju</Link>.</p>
  </div>;
}
