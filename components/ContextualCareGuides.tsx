import Link from 'next/link';
import {contextualCareGuides} from '@/lib/care-guides';
export default function ContextualCareGuides({department,location,specialist,registered,weekend,stage='results'}:{weekend?:string;department?:string;location?:string;specialist?:boolean;registered?:boolean;stage?:'results'|'profile'|'nearby'}){
 const guides=contextualCareGuides({department,location,specialist,registered,weekend,stage});
 return <aside aria-label="Helpful care guides" className="rounded-xl border bg-slate-50 p-4 space-y-2 min-w-0 break-words"><h2 className="text-sm font-bold">{stage==='profile'?'Before your visit':'Guides for your search'}</h2><ul className="grid sm:grid-cols-2 gap-x-5">{guides.map(guide=><li key={guide.slug}><Link href={`/guides/${guide.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline text-sm py-2">{guide.title} ↗</Link></li>)}</ul><p className="text-xs text-slate-500">Guides open in a new tab so you can keep your search.</p></aside>;
}
