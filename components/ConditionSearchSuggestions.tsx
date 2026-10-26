import Link from 'next/link';
import {matchConditionSearch,conditionPath} from '@/lib/condition-search';
export default function ConditionSearchSuggestions({query}:{query:string}){
 const match=matchConditionSearch(query);if(!match)return null;
 return <nav aria-label="Condition record searches" className="rounded-xl border bg-slate-50 p-3 space-y-2 text-slate-800"><p className="text-sm font-semibold">Find {match.condition.name} records</p><p className="text-xs">Verified historical HIRA records in the checked regional directory cohort. This is not a complete list of current providers.</p>{match.nearby?<><Link href="/nearby?department=urology" className="block min-h-11 p-2 underline">Find urology clinics near me</Link><p className="text-xs">Nearby results are not filtered by condition records.</p></>:match.areas.map(a=><Link className="block min-h-11 rounded border bg-white p-2 text-sm underline" key={a.slug} href={conditionPath(match.condition.slug,a.slug)}>{match.condition.name} · {a.name}</Link>)}</nav>;
}
