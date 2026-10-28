'use client';
import {useRef,useState} from 'react';
import {internationalInquiry} from '@/lib/international-inquiry';

export default function InternationalInquiryChecklist(){
 const [expanded,setExpanded]=useState(false),[status,setStatus]=useState(''),[copying,setCopying]=useState(false);
 const text=useRef<HTMLTextAreaElement>(null);
 async function copy(){
  setCopying(true);
  try{await navigator.clipboard.writeText(internationalInquiry);setStatus('Questions copied. Paste them into your own message to the clinic.');}
  catch{setExpanded(true);setStatus('Automatic copy is unavailable. Select and copy the questions below.');requestAnimationFrame(()=>{text.current?.focus();text.current?.select();});}
  finally{setCopying(false);}
 }
 return <section id="inquiry-checklist" aria-labelledby="inquiry-heading" className="scroll-mt-24 rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
  <h2 id="inquiry-heading" className="text-lg sm:text-xl font-bold">Questions to send your clinic</h2>
  <p className="text-sm">Copy an English checklist about costs, records, interpretation, admission and care before and after returning home.</p>
  <button type="button" disabled={copying} onClick={copy} className="min-h-11 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{copying?'Copying…':'Copy English questions'}</button>
  <p role="status" aria-live="polite" className="text-sm">{status}</p>
  <details open={expanded} onToggle={event=>setExpanded(event.currentTarget.open)}><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold underline">Read the questions</summary><label htmlFor="inquiry-questions" className="sr-only">English questions to copy</label><textarea id="inquiry-questions" ref={text} readOnly value={internationalInquiry} rows={14} className="w-full min-w-0 rounded-lg border bg-white p-3 text-base leading-relaxed"/></details>
  <p className="text-xs text-slate-600">No personal details are needed here. Copying does not send an enquiry. Use the clinic’s confirmed secure channel for medical records.</p>
 </section>;
}
