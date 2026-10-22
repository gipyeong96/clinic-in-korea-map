'use client';
import {useEffect,useState} from 'react';
import {MEASUREMENT_OPT_OUT} from '@/lib/measurement';
export default function MeasurementPreference(){
 const [excluded,setExcluded]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{try{setExcluded(localStorage.getItem(MEASUREMENT_OPT_OUT)==='1');setReady(true);}catch{setError('Browser storage is unavailable.');}},[]);
 function change(){try{localStorage.setItem(MEASUREMENT_OPT_OUT,excluded?'0':'1');window.location.reload();}catch{setError('Could not update this browser preference.');}}
 return <div className="space-y-3"><p role="status">{ready?excluded?'This browser is excluded from application analytics.':'Application analytics is enabled for this browser.':'Checking browser preference…'}</p><button type="button" disabled={!ready} onClick={change} className="min-h-11 rounded-lg border bg-white px-4 py-2 font-semibold">{excluded?'Enable analytics in this browser':'Exclude this browser from analytics'}</button><p className="text-sm">This preference stays in this browser only. It does not remove past data or change saved clinics. It takes effect after reloading; use it before future internal testing.</p>{error&&<p role="alert">{error}</p>}</div>;
}
