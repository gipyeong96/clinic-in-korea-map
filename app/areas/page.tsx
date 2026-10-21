import {nationalAreas,nationalProvinces,regionLabel} from '@/lib/national-regions';
import AreaDepartmentFilter from '@/components/AreaDepartmentFilter';
import {areaContext,areaBrowseLink} from '@/lib/area-navigation';
import {SITE_URL} from '@/lib/site';
export const metadata={title:'Find clinics by province, city or district | Korea Clinic Map',alternates:{canonical:`${SITE_URL}/areas`}};
export default function Areas({searchParams={}}:{searchParams?:Record<string,string|string[]|undefined>}){const context=areaContext(searchParams);return <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
  <h1 className="text-3xl font-bold">Find clinics by area</h1>
  <p>Step 1: choose a city or province. Next, choose a district or city within it. Regions with the same name are listed separately.</p>
  <AreaDepartmentFilter context={context}/>
  <form action={`/clinics/${context.department}/all`} className="flex flex-wrap gap-3">
    <label className="flex-1 min-w-40 text-sm font-semibold">Area name<input name="q" placeholder="English or 한국어" required maxLength={200} className="mt-1 block w-full border rounded-lg p-3" /></label>
    {context.specialist&&<input type="hidden" name="specialist" value="1"/>}
    <button className="self-end min-h-11 px-5 py-3 rounded-lg bg-slate-900 text-white">Search</button>
  </form>
  <p className="text-xs text-slate-500">Names and address scopes checked 21 October 2026. <a className="underline" href="https://www.studyinkorea.go.kr/ko/life/regionsIntro.do" target="_blank" rel="noreferrer">Government regional directory</a>. Older province names in source addresses are supported.</p>
  <nav aria-label="Choose city or province" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{nationalProvinces.map(p=><a key={p.slug} href={areaBrowseLink(p.slug,context)} className="bg-white rounded-xl border p-4 min-h-11 hover:border-amber-500"><span className="block font-bold">{p.en} · {p.ko}</span><span className="block text-sm text-slate-500 mt-1">Choose a city or district →</span></a>)}</nav>
</div>;}
