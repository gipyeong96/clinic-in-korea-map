import {conditionRecord,conditionSource,referenceLabel,conditionEnglish} from '@/lib/hira-conditions';
export default function ClinicConditions({record,ykiho}:{record:unknown;ykiho:string}){
 const data=conditionRecord(record,ykiho);if(!data)return null;
 return <section aria-labelledby="hira-conditions-heading" className="rounded-xl border bg-white p-4 sm:p-6 space-y-4 text-sm">
  <h2 id="hira-conditions-heading" className="text-xl font-bold">Conditions reported in HIRA treatment records</h2>
  <p>Up to five frequently treated conditions in HIRA’s historical records, shown alphabetically.</p>
  <ul className="flex flex-wrap gap-2" aria-label="HIRA condition names">{data.conditions.map(name=><li className="rounded-lg border bg-slate-50 px-3 py-2" key={name}>{conditionEnglish[name]?<><span className="block font-semibold">{conditionEnglish[name]}</span><span lang="ko" className="text-xs text-slate-600">{name}</span></>:<span lang="ko">{name}</span>}</li>)}</ul>
  <dl className="grid sm:grid-cols-2 gap-3"><div><dt className="font-semibold">Reference month</dt><dd>{referenceLabel(data.referenceMonth)}</dd></div><div><dt className="font-semibold">Retrieved / checked</dt><dd>{data.checkedAt}</dd></div><div className="sm:col-span-2"><dt className="font-semibold">Coverage period</dt><dd>The preceding year relative to the reference month, as defined by HIRA. Exact start and end dates are not supplied in the response. This is historical information, not live availability.</dd></div></dl>
  <details><summary className="min-h-11 py-3 cursor-pointer underline">How to read this information</summary><div className="space-y-2"><p>Source order is alphabetical, not a ranking by treatment volume. English labels, where available, are editorial translations; original Korean terms are retained. Broad source categories are not a specific diagnosis.</p><p>These records do not establish treatment outcomes, specialist qualifications or current services. Conditions outside this list may also be treated. Confirm your concern with the clinic.</p></div></details>
  <p className="text-xs text-slate-500">Source: <a className="underline" href={conditionSource} target="_blank" rel="noopener noreferrer">HIRA · Clinic top-five condition information</a> · Public data attribution: Health Insurance Review & Assessment Service.</p>
 </section>;
}
