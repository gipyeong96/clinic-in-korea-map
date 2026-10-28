'use client';
import {useState} from 'react';
import Link from 'next/link';
type Region={slug:string;en:string;ko:string;count:number};
export default function EmergencySearchForm({regions,classes,districts,initialRegion,initialDistrict,initialType}:{regions:Region[];classes:{code:string;en:string}[];districts:Record<string,string[]>;initialRegion:string;initialDistrict:string;initialType:string}){
 const [region,setRegion]=useState(initialRegion),[district,setDistrict]=useState(initialDistrict);
 return <form action="/emergency" method="get" className="rounded-xl border bg-white p-4 space-y-3" aria-label="Find emergency institutions"><div className="grid sm:grid-cols-3 gap-3">
  <label className="text-sm font-semibold">City / province<select name="region" value={region} onChange={e=>{setRegion(e.target.value);setDistrict('');}} className="block w-full mt-1 min-h-11 rounded-lg border p-2 bg-white"><option value="">Choose a region</option>{regions.map(r=><option key={r.slug} value={r.slug}>{r.en} · {r.ko} ({r.count})</option>)}</select></label>
  <label className="text-sm font-semibold">District / city (Korean)<select name="district" value={district} onChange={e=>setDistrict(e.target.value)} disabled={!region} className="block w-full mt-1 min-h-11 rounded-lg border p-2 bg-white disabled:bg-slate-100"><option value="">All districts / cities</option>{(districts[region]||[]).map(d=><option key={d} value={d}>{d}</option>)}</select></label>
  <label className="text-sm font-semibold">Official institution type<select name="type" defaultValue={initialType} className="block w-full mt-1 min-h-11 rounded-lg border p-2 bg-white"><option value="">All recorded types</option>{classes.map(c=><option key={c.code} value={c.code}>{c.en}</option>)}</select></label></div>
  <p className="text-xs text-slate-600">No location permission is required. Changing regions resets the district selection.</p><div className="flex gap-3 flex-wrap"><button className="min-h-11 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white" type="submit">Find institutions</button><Link className="inline-flex min-h-11 items-center underline" href="/emergency">Reset filters</Link></div></form>;
}
