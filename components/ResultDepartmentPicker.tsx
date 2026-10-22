 'use client';
import {useRouter} from 'next/navigation';
import labels from '@/lib/department-labels.json';
import {searchLink} from '@/lib/search';
export default function ResultDepartmentPicker({department,location,options}:{department:string;location:string;options:{query?:string;specialist?:boolean;registered?:boolean;radius?:number}}){
 const router=useRouter();
 return <form aria-label="Browse medical departments" onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);router.push(searchLink(String(data.get('department')),location,options));}} className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
 <label className="flex-1 min-w-0 text-sm font-semibold">Medical department<select key={department} name="department" defaultValue={department} className="block w-full border rounded-lg p-3 mt-1"><option value="all">All departments</option>{Object.entries(labels).map(([slug,label])=><option key={slug} value={slug}>{label}</option>)}</select></label>
 <button className="min-h-11 px-4 py-3 rounded-lg bg-slate-900 text-white">Apply department</button>
 </form>;
}
