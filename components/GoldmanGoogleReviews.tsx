'use client';

import {useEffect,useRef,useState} from 'react';
import {useJsApiLoader} from '@react-google-maps/api';
import Link from 'next/link';
import {goldmanBranch} from '@/lib/goldman';
import {goldmanGooglePlace,googlePlaceUrl} from '@/lib/goldman-google';

function ReviewWidget({placeId,apiKey}:{placeId:string;apiKey:string}){
 const host=useRef<HTMLDivElement>(null);
 const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
 // Match the existing results-map loader to avoid loading Maps JavaScript twice.
 const {isLoaded,loadError}=useJsApiLoader({id:'google-map-script',googleMapsApiKey:apiKey});
 useEffect(()=>{
  if(!isLoaded)return;
  let active=true;
  const container=host.current;
  const element=document.createElement('gmp-place-details');
  const ready=()=>{clearTimeout(timeout);if(active)setState('ready');};
  const failed=()=>{if(active)setState('error');};
  const timeout=window.setTimeout(failed,20000);
  element.addEventListener('gmp-load',ready);
  element.addEventListener('gmp-error',failed);
  (async()=>{
   await google.maps.importLibrary('places');
   await customElements.whenDefined('gmp-place-details');
   if(!active)return;
   const request=document.createElement('gmp-place-details-place-request');
   request.setAttribute('place',placeId);
   const config=document.createElement('gmp-place-content-config');
   for(const tag of ['gmp-place-address','gmp-place-rating','gmp-place-reviews','gmp-place-attribution'])config.append(document.createElement(tag));
   element.append(request,config);
   element.style.cssText='display:block;width:100%;max-width:400px;height:540px;color-scheme:light;';
   container?.append(element);
  })().catch(failed);
  return ()=>{active=false;clearTimeout(timeout);element.removeEventListener('gmp-load',ready);element.removeEventListener('gmp-error',failed);element.remove();};
 },[isLoaded,placeId]);
 const failed=loadError||state==='error';
 return <div className="min-w-0">
  {!failed&&state==='loading'&&<p role="status" className="text-sm py-3">Loading Google ratings &amp; reviews…</p>}
  {failed&&<p role="alert" className="rounded-lg border p-4 text-sm">Google reviews could not be loaded. You can still read them on Google Maps using the link below.</p>}
  <div ref={host} hidden={!!failed} className="w-full min-w-0 max-w-[400px]"/>
 </div>;
}

export default function GoldmanGoogleReviews({clinicId}:{clinicId:string}){
 const branch=goldmanBranch(clinicId);
 const place=goldmanGooglePlace(clinicId);
 const [opened,setOpened]=useState(false);
 const apiKey=process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
 if(!branch||!place)return null;
 return <section aria-labelledby="google-reviews-heading" className="rounded-2xl border bg-white p-4 sm:p-6 space-y-4 min-w-0">
  <div><h2 id="google-reviews-heading" className="text-xl font-bold">Google ratings &amp; reviews</h2><p className="text-sm text-slate-600 mt-2">Goldman {branch.name} · {branch.address}</p></div>
  <p className="text-sm">See feedback shared by Google Maps users for this branch. Reviews reflect individual experiences and do not establish treatment suitability.</p>
  {!opened&&apiKey&&<button onClick={()=>setOpened(true)} className="min-h-11 w-full sm:w-auto rounded-lg bg-slate-900 text-white px-5 py-3 font-semibold">Show Google ratings &amp; reviews</button>}
  {opened&&apiKey&&<ReviewWidget placeId={place.placeId} apiKey={apiKey}/>}
  {!apiKey&&<p className="rounded-lg border bg-slate-50 p-4 text-sm">Read this branch’s ratings and reviews directly on Google Maps.</p>}
  <a href={googlePlaceUrl(place.placeId,`Goldman Urology ${branch.name}`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">See this branch on Google Maps ↗</a>
  <p className="text-xs text-slate-500">When you show reviews, your browser connects to Google. We do not copy reviews into our clinic database. <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link></p>
 </section>;
}
