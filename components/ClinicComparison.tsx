'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import type {LibraryClinic} from '@/lib/clinic-library';
import type {ComparisonProfile,ComparisonRow} from '@/lib/clinic-comparison';

const fields:{label:string;value:(p:ComparisonProfile)=>React.ReactNode}[]=[
 {label:'Reported departments',value:p=>p.departments.length?<ul className="space-y-1">{p.departments.map((d,i)=><li key={i}>{d.name}</li>)}</ul>:<span>Not confirmed in this directory. Check the clinic profile or ask the clinic.</span>},
 {label:'Reported specialists',value:p=>p.departmentSource?<><ul className="space-y-1">{p.departments.filter(d=>d.specialists>0).map((d,i)=><li key={i}>{d.name}: {d.specialists}</li>)}</ul>{!p.departments.some(d=>d.specialists>0)&&<p>No positive specialist count in the available record. This does not establish that no specialist works here.</p>}<p className="mt-2 text-xs text-slate-500">Source: {p.departmentSource}</p></>:<span>Not confirmed in this directory.</span>},
 {label:'International-patient registration',value:p=>p.registration?<><p className="font-semibold">Listed in the official registry</p><p className="mt-1">As of {p.registration.date}</p>{p.registration.checked&&<p className="text-xs">Checked {p.registration.checked}</p>}<a className="underline inline-flex min-h-11 items-center" href="https://www.data.go.kr/data/3050000/fileData.do" target="_blank" rel="noopener noreferrer">KHIDI registry ↗</a></>:<span>No confirmed listing in this directory. This does not mean the clinic is unregistered.</span>},
 {label:'Address',value:p=><>{p.address||'Address not available.'}<p className="text-xs text-slate-500 mt-2">Use the Korean address for a taxi or when contacting the clinic.</p></>},
 {label:'Telephone',value:p=>p.phone.href?<a className="min-h-11 inline-flex items-center underline" href={p.phone.href}>{p.phone.display}</a>:<span>{p.phone.display?`${p.phone.display} — confirm this number before calling.`:'Telephone not available.'}</span>},
 {label:'Visit details',value:p=><div className="flex flex-col items-start gap-2"><Link className="min-h-11 inline-flex items-center underline" href={p.path}>View clinic profile</Link>{p.directions&&<a className="min-h-11 inline-flex items-center underline" href={p.directions} target="_blank" rel="noopener noreferrer">Directions ↗</a>}</div>},
];

export default function ClinicComparison({selected}:{selected:LibraryClinic[]}){
 const [rows,setRows]=useState<ComparisonRow[]|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[loadedAt,setLoadedAt]=useState('');
 const controller=useRef<AbortController|null>(null),ticket=useRef(0);
 useEffect(()=>()=>{ticket.current++;controller.current?.abort();},[]);
 async function compare(){
  controller.current?.abort();const abort=new AbortController();controller.current=abort;const current=++ticket.current;setBusy(true);setError('');
  try{
   const ids=selected.map(c=>decodeURIComponent(c.path.split('/').pop()!));
   const response=await fetch('/api/clinics/compare',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({ids}),signal:abort.signal});
   const body=await response.json();if(!response.ok)throw new Error();if(current!==ticket.current)return;
   setRows(body.rows);setLoadedAt(body.loadedAt);
  }catch(e){if(current===ticket.current&&!abort.signal.aborted){setRows(null);setError('Comparison could not be loaded. Please try again. Your saved clinics are unchanged.');}}
  finally{if(current===ticket.current)setBusy(false);}
 }
 const label=(row:ComparisonRow,index:number)=>row.status==='ok'?row.profile.name:selected[index]?.name||'Clinic';
 const cell=(row:ComparisonRow,field:typeof fields[number])=>row.status==='ok'?field.value(row.profile):<span>This profile is unavailable in the directory right now. Try refreshing the comparison or open its saved profile below.</span>;
 return <section aria-labelledby="compare-heading" className="rounded-xl border bg-white p-4 space-y-4 min-w-0">
  <h2 id="compare-heading" className="scroll-mt-24 text-xl font-bold">Compare saved clinics</h2>
  <p className="text-sm">Select two or three saved clinics below, then compare their directory information. Clinics appear in your selection order.</p>
  <p role="status" className="text-sm font-semibold">{selected.length} of 3 selected{selected.length===1?' · Choose one more clinic.':''}</p>
  <button type="button" disabled={selected.length<2||busy} onClick={compare} className="min-h-11 rounded-lg bg-slate-900 text-white px-5 py-3 font-semibold disabled:opacity-50">{busy?'Loading comparison…':rows?'Refresh comparison':'Compare selected clinics'}</button>
  {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
  {rows&&!busy&&<><p className="text-xs text-slate-500">Loaded from the directory {new Date(loadedAt).toLocaleString()}. Source records may be older; confirm current services directly.</p>
   <p className="rounded-lg bg-slate-50 p-3 text-sm">Registration does not confirm English or interpretation support. Specialist counts are department-specific. This comparison is not a ranking or a treatment recommendation.</p>
   <div className="hidden md:block"><table className="w-full table-fixed text-left text-sm break-words"><caption className="text-left py-3 font-semibold">Directory comparison</caption><thead><tr className="border-b"><th scope="col" className="p-3 w-36">Information</th>{rows.map((r,i)=><th scope="col" key={r.id} className="p-3 align-top">{label(r,i)}</th>)}</tr></thead><tbody>{fields.map(f=><tr key={f.label} className="border-b align-top"><th scope="row" className="p-3">{f.label}</th>{rows.map(r=><td key={r.id} className="p-3">{cell(r,f)}</td>)}</tr>)}</tbody></table></div>
   <div className="md:hidden space-y-5">{fields.map(f=><section key={f.label} className="space-y-2"><h3 className="font-bold border-b pb-2">{f.label}</h3><dl className="space-y-3">{rows.map((r,i)=><div key={r.id} className="rounded-lg bg-slate-50 p-3"><dt className="text-sm font-semibold mb-2">{label(r,i)}</dt><dd className="text-sm">{cell(r,f)}</dd></div>)}</dl></section>)}</div>
   {rows.some(r=>r.status!=='ok')&&<p role="status" className="text-sm">Some profiles could not be confirmed. Refresh or choose a different clinic; your saved list has not been changed.</p>}
   <Link className="inline-flex min-h-11 items-center underline text-sm" href="/guides/understand-clinic-information">How to read these fields</Link>
  </>}
 </section>;
}
