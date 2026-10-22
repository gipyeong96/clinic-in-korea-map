'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {LibraryClinic,ClinicLibrary,LIBRARY_KEY,readLibrary,updateLibrary,normalizeLibraryClinic} from '@/lib/clinic-library';
import ClinicComparison from '@/components/ClinicComparison';

function useLibrary(){
  const [library,setLibrary]=useState<ClinicLibrary>({saved:[],recent:[]});
  const [ready,setReady]=useState(false),[error,setError]=useState('');
  useEffect(()=>{
    const refresh=()=>{try{setLibrary(readLibrary(localStorage.getItem(LIBRARY_KEY)));setReady(true);}catch{setError('Storage is unavailable. Allow browser storage to save clinics.');setReady(true);}};
    refresh();window.addEventListener('clinic-library',refresh);window.addEventListener('storage',refresh);
    return ()=>{window.removeEventListener('clinic-library',refresh);window.removeEventListener('storage',refresh);};
  },[]);
  function change(clinic:LibraryClinic,action:'save'|'visit'|'remove-recent'){
    clinic=normalizeLibraryClinic(clinic);
    try{
      const current=readLibrary(localStorage.getItem(LIBRARY_KEY));
      if(action==='save'&&current.saved.length>=100&&!current.saved.some(c=>c.id===clinic.id)){setError('You can save up to 100 clinics. Remove a saved clinic first.');return;}
      localStorage.setItem(LIBRARY_KEY,JSON.stringify(updateLibrary(current,clinic,action)));
      setError('');window.dispatchEvent(new Event('clinic-library'));
    }catch{setError('Could not save changes. Browser storage may be unavailable or full.');}
  }
  return {library,ready,error,change};
}

export function SaveClinic({clinic}:{clinic:LibraryClinic}){
  clinic=normalizeLibraryClinic(clinic);
  const {library,ready,error,change}=useLibrary();
  const saved=library.saved.some(c=>c.id===clinic.id);
  return <div><button type="button" disabled={!ready} aria-pressed={saved} aria-label={`${saved?'Unsave':'Save'} ${clinic.name}`} title="Save in this browser on this device. No sign-up needed." onClick={()=>change(clinic,'save')} className="min-h-11 border rounded-lg px-3 py-2 text-sm font-semibold bg-white disabled:opacity-50">{saved?'★ Saved':'☆ Save clinic'}</button>{error&&<p role="status" className="text-xs text-rose-700 mt-1">{error}</p>}</div>;
}

export function RecordClinicVisit({clinic}:{clinic:LibraryClinic}){
  useEffect(()=>{try{const current=readLibrary(localStorage.getItem(LIBRARY_KEY));localStorage.setItem(LIBRARY_KEY,JSON.stringify(updateLibrary(current,clinic,'visit')));window.dispatchEvent(new Event('clinic-library'));}catch{/* Viewing a clinic remains possible when local storage is disabled. */}},[clinic.id]);
  return null;
}

export default function ClinicLibraryPage(){
  const {library,ready,error,change}=useLibrary();
  const [selected,setSelected]=useState<string[]>([]);
  const chosen=selected.map(id=>library.saved.find(c=>c.id===id)).filter((c):c is LibraryClinic=>!!c);
  function choose(id:string){setSelected(current=>{const valid=current.filter(value=>library.saved.some(c=>c.id===value));return valid.includes(id)?valid.filter(value=>value!==id):valid.length<3?[...valid,id]:valid;});}
  return <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 min-w-0 break-words">
    <h1 className="text-3xl font-bold">My clinics</h1>
    <p className="font-semibold">Save clinics on this device — no sign-up needed.</p>
    <p className="text-sm text-slate-600">Saved clinics and the last 20 clinic profiles you viewed are stored only in this browser on this device. They are not synced to an account. Clearing browser data removes this list.</p>
    {error&&<p role="status" className="text-sm text-rose-700">{error}</p>}
    {ready&&!error&&library.saved.length>0&&<ClinicComparison key={chosen.map(c=>c.id).join('|')} selected={chosen}/>}
    {!ready?<p role="status">Loading your clinics…</p>:<>{(['saved','recent'] as const).map(kind=><section key={kind} className="space-y-3" aria-label={kind==='saved'?'Saved clinics':'Recently viewed clinics'}>
      <h2 className="text-xl font-bold">{kind==='saved'?'Saved clinics':'Recently viewed'} ({library[kind].length})</h2>
      {!library[kind].length?<div className="rounded-xl border bg-white p-5 text-sm text-slate-600 space-y-3"><p>{kind==='saved'?'Choose “Save clinic” on a clinic card or profile to keep it here.':'Clinic profiles you open will appear here.'}</p>{kind==='saved'&&<><Link href="/" className="min-h-11 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">Find a clinic to save</Link><p className="text-xs">After saving clinics, you can choose two or three to compare.</p></>}</div>:<ul className="space-y-3">{library[kind].map(clinic=><li key={clinic.id} className="rounded-xl border bg-white p-4 space-y-2">
        <Link href={clinic.path} className="font-bold underline block">{clinic.name}</Link>
        {clinic.nameKo!==clinic.name&&<p className="text-sm text-slate-500">{clinic.nameKo}</p>}
        <p className="text-sm">{clinic.region}</p><p className="text-sm text-slate-600">{clinic.address}</p>
        <div className="flex flex-wrap gap-2"><SaveClinic clinic={clinic}/>{kind==='saved'&&<label className="min-h-11 flex items-center gap-2 px-2 text-sm font-semibold"><input type="checkbox" checked={chosen.some(c=>c.id===clinic.id)} disabled={chosen.length>=3&&!chosen.some(c=>c.id===clinic.id)} onChange={()=>choose(clinic.id)} aria-label={`Compare ${clinic.name}`}/>Compare</label>}{kind==='recent'&&<button type="button" onClick={()=>change(clinic,'remove-recent')} className="min-h-11 px-3 py-2 text-sm underline" aria-label={`Remove ${clinic.name} from recently viewed`}>Remove from recent</button>}</div>
      </li>)}</ul>}
      {kind==='saved'&&chosen.length>0&&<a href="#compare-heading" className="inline-flex min-h-11 items-center underline text-sm">Compare {chosen.length} selected clinics ↑</a>}
    </section>)}<p className="text-xs text-slate-500">List details reflect when a clinic was saved or viewed. Open its profile for current information.</p></>}
    <Link href="/" className="inline-flex min-h-11 items-center underline">Find more clinics</Link>
  </div>;
}

export function RecentClinicsHome(){
 const {library,ready,error}=useLibrary();
 if(!ready||error||!library.recent.length)return null;
 return <section aria-labelledby="continue-heading" className="max-w-6xl mx-auto px-4 space-y-3">
 <h2 id="continue-heading" className="text-xl font-bold">Continue browsing</h2>
 <p className="text-sm text-slate-600">Recently viewed in this browser on this device.</p>
 <ul className="grid sm:grid-cols-3 gap-3">{library.recent.slice(0,3).map((clinic,index)=><li key={clinic.id} className={index>0?'hidden sm:list-item':undefined}><Link href={clinic.path} className="block rounded-xl border bg-white p-4 min-h-11 hover:border-amber-500"><span className="block font-semibold">{clinic.name}</span><span className="block mt-1 text-sm text-slate-600">{clinic.region}</span></Link></li>)}</ul>
 <Link href="/my-clinics" className="inline-flex min-h-11 items-center underline text-sm">View all in My clinics</Link>
 </section>;
}

export function SavedComparisonNotice(){
 const {library,ready,error}=useLibrary();
 const [dismissed,setDismissed]=useState('');
 const signature=library.saved.map(c=>c.id).join('|');
 if(!ready||error||!library.saved.length||dismissed===signature)return null;
 return <aside aria-label="Saved clinics comparison shortcut" className="fixed bottom-3 left-3 right-3 z-40 max-w-2xl mx-auto rounded-xl border border-slate-300 bg-white shadow-lg p-3 flex items-center gap-3 max-[360px]:flex-wrap max-[360px]:gap-2">
  <div className="min-w-0 flex-1 max-[360px]:basis-full"><p role="status" className="text-sm font-bold">{library.saved.length} saved {library.saved.length===1?'clinic':'clinics'}</p><p className="text-xs text-slate-600">{library.saved.length===1?'Save one more clinic to compare.':'Choose two or three in My clinics to compare.'}</p></div>
  <Link href="/my-clinics#compare-heading" className="min-h-11 max-[360px]:flex-1 justify-center inline-flex items-center rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-semibold">{library.saved.length===1?'View saved':'Compare clinics'}</Link>
  <button type="button" aria-label="Dismiss saved clinics shortcut" onClick={()=>setDismissed(signature)} className="min-h-11 min-w-11 text-xl">×</button>
 </aside>;
}
