import {nationalAreas,nationalProvinces,regionLabel} from '@/lib/national-regions';
import {SITE_URL} from '@/lib/site';
export const metadata={title:'Find clinics by province, city or district | Korea Clinic Map',alternates:{canonical:`${SITE_URL}/areas`}};
export default function Areas(){return <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
  <h1 className="text-3xl font-bold">Find clinics by area</h1>
  <p>Choose a province, city or district. Regions with the same name are listed separately.</p>
  <form action="/clinics/all/all" className="flex flex-wrap gap-3">
    <label className="flex-1 min-w-40 text-sm font-semibold">Area name<input name="q" placeholder="English or 한국어" required maxLength={200} className="mt-1 block w-full border rounded-lg p-3" /></label>
    <button className="self-end min-h-11 px-5 py-3 rounded-lg bg-slate-900 text-white">Search</button>
  </form>
  <p className="text-xs text-slate-500">Names and address scopes checked 21 October 2026. <a className="underline" href="https://www.studyinkorea.go.kr/ko/life/regionsIntro.do" target="_blank" rel="noreferrer">Government regional directory</a>. Older province names in source addresses are supported.</p>
  <div className="space-y-3">{nationalProvinces.map(p=><details key={p.slug} className="bg-white rounded-xl border p-4">
    <summary className="cursor-pointer min-h-11 py-2 text-lg font-bold break-words">{p.en} · {p.ko}</summary>
    <a className="inline-flex min-h-11 items-center underline text-sm py-3" href={`/clinics/all/${p.slug}`}>All clinics in {p.en}</a>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{nationalAreas.filter(a=>a.province===p.slug).map(a=><a key={a.slug} className="min-h-11 p-3 text-sm rounded-lg border break-words hover:border-amber-500" href={`/clinics/all/${a.slug}`}>{regionLabel(a.slug)}</a>)}</div>
  </details>)}</div>
</div>;}
