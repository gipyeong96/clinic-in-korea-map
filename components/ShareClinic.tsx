'use client';
import {useState} from 'react';
export default function ShareClinic({name,url}:{name:string;url:string}){
 const [status,setStatus]=useState(''),[manual,setManual]=useState(false);
 async function copy(){try{await navigator.clipboard.writeText(url);setStatus('Clinic link copied');setManual(false);}catch{setManual(true);setStatus('Select and copy the clinic link below.');}}
 async function share(){
  if(!navigator.share){await copy();return;}
  try{await navigator.share({title:name,text:name,url});setStatus('Share request completed');}
  catch(error){if(error instanceof DOMException&&error.name==='AbortError')return;await copy();}
 }
 return <section aria-label="Share this clinic" className="space-y-2"><div className="flex flex-wrap gap-2"><button type="button" onClick={share} className="min-h-11 rounded-lg border bg-white px-3 py-2 text-sm font-semibold">Share clinic</button><button type="button" onClick={copy} className="min-h-11 rounded-lg border bg-white px-3 py-2 text-sm font-semibold">Copy clinic link</button></div>{status&&<p role="status" className="text-xs text-slate-600">{status}</p>}{manual&&<label className="block text-xs">Clinic link<input readOnly value={url} onFocus={event=>event.currentTarget.select()} className="mt-1 block w-full rounded-lg border p-3 text-sm"/></label>}</section>;
}
