'use client';
import Script from 'next/script';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {MEASUREMENT_ID,measurementExcluded,measurementPayload,measurementCampaign,measure} from '@/lib/measurement';
type AnalyticsWindow=Window&{dataLayer?:unknown[];gtag?:(...args:unknown[])=>void};
export default function GoogleAnalytics(){
 const path=usePathname(),last=useRef<string|null>(null);
 const [enabled,setEnabled]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{setEnabled(!measurementExcluded());},[]);
 useEffect(()=>{if(ready&&enabled&&path&&last.current!==path){measure('page_view',last.current===null?document.referrer:'');last.current=path;}},[path,enabled,ready]);
 useEffect(()=>{
  if(!ready)return;
  const click=(event:MouseEvent)=>{const target=event.target instanceof Element?event.target.closest('a[href]'):null;if(!target)return;const href=target.getAttribute('href')||'';if(href.startsWith('tel:'))measure('call_click');else if(href.startsWith('https://www.google.com/maps/dir/'))measure('directions_click');};
  const submit=(event:Event)=>{const form=event.target;if(form instanceof HTMLFormElement&&(/\/clinics\/|\/nearby/.test(form.getAttribute('action')||'')||form.getAttribute('aria-label')==='Search clinics'))measure('search_submit');};
  document.addEventListener('click',click);document.addEventListener('submit',submit);return()=>{document.removeEventListener('click',click);document.removeEventListener('submit',submit);};
 },[ready]);
 if(!enabled)return null;
 return <Script id="clinic-map-google-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`} strategy="afterInteractive" onReady={()=>{const analytics=window as AnalyticsWindow;analytics.dataLayer=analytics.dataLayer||[];analytics.gtag=analytics.gtag||function(){analytics.dataLayer!.push(arguments);};analytics.gtag('js',new Date());analytics.gtag('config',MEASUREMENT_ID,{...measurementPayload('page_view',window.location.pathname,document.referrer),...measurementCampaign(window.location.search),send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});setReady(true);}}/>;
}
