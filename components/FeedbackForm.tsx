'use client';
import {useState} from 'react';
import {FEEDBACK_EMAIL,feedbackMail} from '@/lib/feedback';
export default function FeedbackForm({initialType,initialName='',initialUrl=''}:{initialType:string;initialName?:string;initialUrl?:string}){
 const [type,setType]=useState(initialType==='correction'?'correction':'suggestion');
 const [message,setMessage]=useState(''),[url,setUrl]=useState(initialUrl),[name,setName]=useState(initialName),[opened,setOpened]=useState(false);
 return <form className="space-y-5" onSubmit={event=>{event.preventDefault();window.location.href=feedbackMail(type,message,url,name);setOpened(true);}}>
 <label className="block font-semibold text-sm">What would you like to share?<select value={type} onChange={e=>{setType(e.target.value);setOpened(false);}} className="mt-2 block w-full rounded-lg border bg-white p-3"><option value="correction">Report incorrect information</option><option value="suggestion">Suggest a feature</option></select></label>
 <label className="block font-semibold text-sm">Clinic name (optional)<input value={name} onChange={e=>{setName(e.target.value);setOpened(false);}} maxLength={200} className="mt-2 block w-full rounded-lg border p-3" /></label>
 <label className="block font-semibold text-sm">Clinic or page link (optional)<input type="url" value={url} onChange={e=>{setUrl(e.target.value);setOpened(false);}} maxLength={1000} placeholder="https://map.clinicinkorea.com/..." className="mt-2 block w-full rounded-lg border p-3"/></label>
 <label className="block font-semibold text-sm">Your message<textarea required value={message} onChange={e=>{setMessage(e.target.value);setOpened(false);}} maxLength={3000} rows={6} placeholder="Tell us what needs correcting, or how we can improve the map." className="mt-2 block w-full rounded-lg border p-3"/></label>
 <p className="text-sm text-slate-600">For map information and feature feedback. Please leave out medical records and other sensitive personal information.</p>
 <button type="submit" className="min-h-11 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white">Open email app</button>
 {opened&&<p role="status" className="rounded-lg border bg-slate-50 p-3 text-sm">Your email app should open with a draft. Send the email there to submit your feedback. If nothing opens, email {FEEDBACK_EMAIL} directly.</p>}
 <p className="text-sm text-slate-600">This form prepares an email; it does not send it automatically. You can also write directly to <a className="underline break-all" href={`mailto:${FEEDBACK_EMAIL}`}>{FEEDBACK_EMAIL}</a>.</p>
 </form>;
}
