import {goldmanBranches} from '@/lib/goldman';

const groups = [
 {title:'Seoul',note:'Gangnam is in Seocho-gu near Yangjae Station. Seoul Station is in Jung-gu; Jamsil is in Songpa-gu.',ids:['goldman-gangnam','goldman-seoulyeok','goldman-jamsil']},
 {title:'Incheon',note:'A separate city from Seoul. This branch is near Arts Center Station in Namdong-gu.',ids:['goldman-incheon']},
 {title:'Dongtan · Hwaseong',note:'In Gyeonggi-do, outside Seoul. This branch is near Dongtan Station (SRT / GTX-A).',ids:['goldman-dongtan']},
];

export default function GuideBranchLocations(){
 return <nav aria-label="Choose a branch by location" className="rounded-xl border bg-slate-50 p-4 space-y-4 text-sm">
  <div className="space-y-2"><h3 className="font-bold text-base">Which location fits your stay?</h3><p>Start with where you are staying. Compare the route from your accommodation, then confirm your appointment with the branch.</p></div>
  {groups.map(group=><div key={group.title} className="space-y-2"><h4 className="font-semibold">{group.title}</h4><p className="text-slate-700">{group.note}</p><div className="flex flex-wrap gap-2">{group.ids.map(id=>{const branch=goldmanBranches.find(b=>b.id===id)!;return <a key={id} href={'#guide-branch-'+id} className="inline-flex min-h-11 items-center rounded-lg border bg-white px-3 py-2 font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{branch.name} details ↓</a>;})}</div></div>)}
  <p className="text-xs text-slate-600">Tap a location to jump to its card. Open “Address & travel details” for the address and official location guide. Confirm the specific care and appointment availability before travelling.</p>
 </nav>;
}
