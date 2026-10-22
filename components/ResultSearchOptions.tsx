'use client';
import {useEffect,useId,useState} from 'react';
export default function ResultSearchOptions({summary,children}:{summary:string;children:React.ReactNode}){
 const [expanded,setExpanded]=useState(false);const id=useId();
 useEffect(()=>{const reveal=()=>{if(['#search-radius','#change-station'].includes(window.location.hash))setExpanded(true);};reveal();window.addEventListener('hashchange',reveal);return()=>window.removeEventListener('hashchange',reveal);},[]);
 return <section aria-label="Search options" className="space-y-3 min-w-0">
  <div className="md:hidden rounded-xl border bg-white p-3 space-y-2"><p className="text-xs font-semibold text-slate-500">Current search</p><p className="text-sm break-words">{summary}</p><button type="button" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(value=>!value)} className="min-h-11 inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold">{expanded?'Hide search options':'Change search options'}</button></div>
  <div id={id} className={`${expanded?'block':'hidden'} md:block space-y-3`}>{children}</div>
 </section>;
}
