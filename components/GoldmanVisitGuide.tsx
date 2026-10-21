import {goldmanBranch,goldmanBranches,goldmanLocationUrl,GOLDMAN_ENGLISH_URL,GOLDMAN_CHECKED} from '@/lib/goldman';
import {clinicPhone} from '@/lib/clinic-contact';
function Branch({branch}:{branch:typeof goldmanBranches[number]}){
 const phone=clinicPhone(branch.phone);
 return <section aria-label={`${branch.name} branch visit information`} className="rounded-xl border bg-white p-4 space-y-3">
 <h3 className="text-lg font-bold">{branch.name} branch</h3>
 <p className="text-sm">{branch.address}</p>
 <p className="text-sm text-slate-600">{branch.transit}</p>
 <dl className="text-sm space-y-2"><div><dt className="font-semibold">Weekdays</dt><dd>{branch.weekday}</dd></div><div><dt className="font-semibold">Saturday</dt><dd>{branch.saturday}</dd></div><div><dt className="font-semibold">Lunch break</dt><dd>{branch.lunch}</dd></div><div><dt className="font-semibold">Sundays & public holidays</dt><dd>Closed for regular consultations</dd></div></dl>
 {branch.stone24&&<p className="rounded-lg bg-slate-50 p-3 text-sm">The official site lists a 24-hour urinary stone center at this branch. Call the branch before visiting outside regular hours.</p>}
 <div className="flex flex-wrap gap-2"><a href={phone.href!} className="min-h-11 inline-flex items-center rounded-lg bg-slate-900 text-white px-4 py-2 font-semibold text-sm" aria-label={`Call Goldman ${branch.name} ${phone.display}`}>Call {phone.display}</a><a href={goldmanLocationUrl(branch.tab)} target="_blank" rel="noopener noreferrer" className="min-h-11 inline-flex items-center rounded-lg border px-4 py-2 text-sm">Official {branch.name} directions ↗</a></div>
 </section>;
}
export default function GoldmanVisitGuide({clinicId}:{clinicId?:string}){
 const current=clinicId?goldmanBranch(clinicId):undefined;
 if(clinicId&&!current)return null;
 return <section aria-labelledby="goldman-visit-heading" className="space-y-4">
 <h2 id="goldman-visit-heading" className="text-xl font-bold">Goldman branch visit guide</h2>
 <a href={GOLDMAN_ENGLISH_URL} target="_blank" rel="noopener noreferrer" className="min-h-11 inline-flex items-center rounded-lg border border-amber-400 bg-white px-4 py-3 font-semibold">Visit official English website ↗</a>
 <p className="text-sm text-slate-600">Bring photo ID for first and follow-up visits. Confirm your appointment and current opening hours with your branch.</p>
 {current?<><Branch branch={current}/><details><summary className="min-h-11 py-3 cursor-pointer font-semibold">Other Goldman branches</summary><div className="grid sm:grid-cols-2 gap-3">{goldmanBranches.filter(b=>b.id!==current.id).map(branch=><Branch key={branch.id} branch={branch}/>)}</div></details></>:<div className="grid sm:grid-cols-2 gap-3">{goldmanBranches.map(branch=><Branch key={branch.id} branch={branch}/>)}</div>}
 <p className="text-xs text-slate-500">Source: <a href={GOLDMAN_ENGLISH_URL+'support/location'} target="_blank" rel="noopener noreferrer" className="underline">Goldman official English location guide</a> · Checked {GOLDMAN_CHECKED}. Walking distances are the clinic’s published guidance.</p>
 </section>;
}
