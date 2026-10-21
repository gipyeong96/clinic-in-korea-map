 'use client';
import {useState} from 'react';
import Link from 'next/link';
import {AreaItem,findAreas} from '@/lib/area-quick-find';
export default function AreaQuickFind({items,label}:{items:AreaItem[];label:string}){
 const [query,setQuery]=useState('');
 const visible=findAreas(items,query);
 return <section className="space-y-3" aria-label={label}>
 <div className="flex items-end gap-2"><label className="block flex-1 text-sm font-semibold">{label}<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Type in English or 한국어" maxLength={100} className="mt-1 block w-full border rounded-lg p-3"/></label>{query&&<button onClick={()=>setQuery('')} className="min-h-11 rounded-lg border px-4">Clear</button>}</div>
 <p role="status" className="text-sm text-slate-600">{visible.length} {visible.length===1?'area':'areas'} shown · A–Z by English name</p>
 {!visible.length&&<p>No matching areas. Try another spelling or clear your search.</p>}
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">{visible.map(item=><section key={item.id} aria-label={`${item.en} · ${item.ko}`} className="rounded-xl border bg-white p-4 space-y-2"><Link href={item.href} className="min-h-11 flex items-center font-semibold underline">{item.en} · {item.ko}</Link>{!!item.children?.length&&<details key={query?'filtered':'all'} open={query.trim()?true:undefined}><summary className="cursor-pointer min-h-11 py-3 text-sm">Choose a district in {item.en}</summary><nav aria-label={`Districts in ${item.en}`} className="space-y-2">{item.children.map(child=><Link key={child.id} href={child.href} className="min-h-11 flex items-center rounded-lg border px-3 py-2 text-sm">{child.en} · {child.ko}</Link>)}</nav></details>}</section>)}</div>
 </section>;
}
