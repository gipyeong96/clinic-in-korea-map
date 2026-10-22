import labels from '@/lib/department-labels.json';
import {nearbyDepartments} from '@/lib/nearby';
export default function HomeNearbySearch(){
 const preferred=new Set(nearbyDepartments.map(d=>d.slug));
 const options=[...nearbyDepartments.map(d=>[d.slug,(labels as Record<string,string>)[d.slug]]),...Object.entries(labels).filter(([slug])=>!preferred.has(slug))];
 return <form action="/nearby" method="get" aria-label="Find clinics near me" className="max-w-xl mx-auto rounded-xl border border-slate-500 bg-slate-800/50 p-3 space-y-2 text-left"><div className="flex items-center gap-2"><label className="flex-1 min-w-0"><span className="sr-only">Department for nearby search</span><select name="department" defaultValue="all" className="block w-full min-h-11 rounded-lg border border-slate-500 bg-slate-900 text-white p-2 text-sm"><option value="all">All departments</option>{options.map(([slug,label])=><option key={slug} value={slug}>{label}</option>)}</select></label><button type="submit" className="min-h-11 shrink-0 rounded-lg bg-white text-slate-900 px-3 py-2 text-sm font-semibold">Find nearby</button></div><p className="text-xs text-slate-300">Location access starts only when you choose “Use my location” on the next screen.</p></form>;
}
