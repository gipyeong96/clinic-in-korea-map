import AreaQuickFind from '@/components/AreaQuickFind';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {nationalAreas,nationalProvinces,regionLabel} from '@/lib/national-regions';
import AreaDepartmentFilter from '@/components/AreaDepartmentFilter';
import {areaContext,areaBrowseLink,areaClinicLink} from '@/lib/area-navigation';
import {SITE_URL} from '@/lib/site';
type Props={params:{province:string};searchParams?:Record<string,string|string[]|undefined>};
export function generateStaticParams(){return nationalProvinces.map(p=>({province:p.slug}));}
export function generateMetadata({params}:Props){const p=nationalProvinces.find(p=>p.slug===params.province);return p?{title:`Choose an area in ${p.en} | Korea Clinic Map`,alternates:{canonical:`${SITE_URL}/areas/${p.slug}`}}:{};}
export default function ProvinceAreas({params,searchParams={}}:Props){
 const province=nationalProvinces.find(p=>p.slug===params.province);if(!province)notFound();
 const context=areaContext(searchParams);
 const areas=nationalAreas.filter(a=>a.province===province.slug);
 const roots=areas.filter(a=>!('parent' in a)||!areas.some(parent=>parent.ko===a.parent));
 return <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
 <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm"><Link href="/" className="min-h-11 inline-flex items-center underline">Home</Link><span aria-hidden="true" className="py-3">›</span><Link href={areaBrowseLink(undefined,context)} className="min-h-11 inline-flex items-center underline">All cities & provinces</Link><span aria-hidden="true" className="py-3">›</span><span className="py-3">{province.en}</span></nav>
 <h1 className="text-2xl sm:text-3xl font-bold">Choose an area in {province.en}</h1><p className="text-sm text-slate-600">{province.ko} · Step 2: choose a city or district. Cities with smaller districts can be expanded below.</p>
 <Link href={areaClinicLink(province.slug,context)} className="min-h-11 inline-flex items-center rounded-lg bg-slate-900 px-4 py-3 text-white font-semibold">{context.department==='all'?'All clinics':'Selected clinics'} in {province.en}</Link>
 <AreaDepartmentFilter context={context} province={province.slug}/>
 <AreaQuickFind label="Find a city or district" items={roots.map(area=>({id:area.slug,en:area.en,ko:area.ko,href:areaClinicLink(area.slug,context),children:areas.filter(a=>'parent' in a&&a.parent===area.ko).map(child=>({id:child.slug,en:child.en,ko:child.ko,href:areaClinicLink(child.slug,context)}))}))}/>

 {!roots.length&&<p className="text-sm text-slate-600">No smaller areas are listed in the current directory. Use “All clinics” above.</p>}
 </div>;
}
