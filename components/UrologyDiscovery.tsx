import {urologyAreas,urologyAreaLinks,urologyChoiceGuides} from '@/lib/urology-discovery';
import PartnerClinicCards from '@/components/PartnerClinicCards';
export default function UrologyDiscovery({location,showPartners}:{location:string;showPartners:boolean}){
 const area=urologyAreas[location];if(!area)return null;
 const guide=urologyChoiceGuides[location];
 return <section aria-label="Urology comparison and partner information" className="rounded-xl border border-blue-200 bg-white p-3 space-y-2 text-sm">
 <h2 className="font-bold">Urology clinics &amp; reported specialists</h2>
 <p className="text-slate-700">{area.scope}</p>
 <p>Looking for a urologist? Compare reported urology specialists in the results below. Confirm current services, fees and language support directly with the clinic.</p>
 {guide&&<details><summary className="cursor-pointer min-h-11 py-3 font-semibold">{guide.question}</summary><p>{guide.answer}</p><a className="inline-flex min-h-11 items-center underline" href={guide.href}>{guide.label} →</a><p className="py-2">Need English consultation or interpretation? Confirm arrangements with the exact clinic before booking. An English website or international-patient registration does not confirm language support.</p></details>}
 {showPartners&&<PartnerClinicCards ids={area.branches}/>}
 <details><summary className="cursor-pointer min-h-11 py-3 font-semibold">Comparison tips & other areas</summary><p>Partner placement is separate from clinic results and is not a quality ranking.</p><p className="py-2">Check reported specialists, services, language support, fees and appointments directly with the clinic. Registration does not confirm English support. Save clinics to <a href="/my-clinics" className="underline">compare their information</a>.</p><nav aria-label="Urology area comparisons" className="flex flex-wrap gap-2">{urologyAreaLinks.map(([slug,label])=><a key={slug} href={'/clinics/urology/'+slug} className="min-h-11 inline-flex items-center rounded-lg border px-3 underline">{label}</a>)}</nav></details>
 </section>;
}
