import Link from 'next/link';
import {notFound} from 'next/navigation';
import {nationalAreas,nationalProvinces,regionLabel} from '@/lib/national-regions';
import {SITE_URL} from '@/lib/site';
type Props={params:{province:string}};
export function generateStaticParams(){return nationalProvinces.map(p=>({province:p.slug}));}
export function generateMetadata({params}:Props){const p=nationalProvinces.find(p=>p.slug===params.province);return p?{title:`Choose an area in ${p.en} | Korea Clinic Map`,alternates:{canonical:`${SITE_URL}/areas/${p.slug}`}}:{};}
export default function ProvinceAreas({params}:Props){
 const province=nationalProvinces.find(p=>p.slug===params.province);if(!province)notFound();
 const areas=nationalAreas.filter(a=>a.province===province.slug);
 const roots=areas.filter(a=>!('parent' in a)||!areas.some(parent=>parent.ko===a.parent));
 return <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
 <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm"><Link href="/" className="min-h-11 inline-flex items-center underline">Home</Link><span aria-hidden="true" className="py-3">›</span><Link href="/areas" className="min-h-11 inline-flex items-center underline">All cities & provinces</Link><span aria-hidden="true" className="py-3">›</span><span className="py-3">{province.en}</span></nav>
 <h1 className="text-2xl sm:text-3xl font-bold">Choose an area in {province.en}</h1><p className="text-sm text-slate-600">{province.ko} · Step 2: choose a city or district. Cities with smaller districts can be expanded below.</p>
 <Link href={`/clinics/all/${province.slug}`} className="min-h-11 inline-flex items-center rounded-lg bg-slate-900 px-4 py-3 text-white font-semibold">All clinics in {province.en}</Link>
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">{roots.map(area=>{const children=areas.filter(a=>'parent' in a&&a.parent===area.ko);return <section key={area.slug} aria-label={regionLabel(area.slug)!} className="rounded-xl border bg-white p-4 space-y-2"><Link href={`/clinics/all/${area.slug}`} className="min-h-11 flex items-center font-semibold underline">{area.en} · {area.ko}</Link>{children.length>0&&<details><summary className="cursor-pointer min-h-11 py-3 text-sm">Choose a district in {area.en}</summary><nav aria-label={`Districts in ${area.en}`} className="space-y-2">{children.map(child=><Link key={child.slug} href={`/clinics/all/${child.slug}`} className="min-h-11 flex items-center rounded-lg border px-3 py-2 text-sm">{child.en} · {child.ko}</Link>)}</nav></details>}</section>;})}</div>
 {!roots.length&&<p className="text-sm text-slate-600">No smaller areas are listed in the current directory. Use “All clinics” above.</p>}
 </div>;
}
