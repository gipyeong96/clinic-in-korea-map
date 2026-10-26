import {stationPages} from './stations';
import {matchRegions,nationalProvinces,nationalAreas,regionLabel} from './national-regions';
import {homeSearchPath,searchLink,hasNearMeIntent} from './search';

export type HomeSuggestion={label:string;detail:string;href:string};
const normalize=(s:string)=>s.toLowerCase().replace(new RegExp('[^\\p{L}\\p{N}]','gu'),'');
const stationIndex=stationPages.map(s=>({station:s,aliases:[s.name_en,s.name_en.replace(/ station$/i,''),s.name_ko,s.name_ko.replace(/역$/,'') ,...(s.slug==='station-86b835f49957a6'?['Hongdae','홍대']:[])]}));
function occurrence(input:string,alias:string){
  const at=input.toLowerCase().indexOf(alias.toLowerCase());
  if(at<0)return null;
  const before=input[at-1],after=input[at+alias.length];
  if((before&&new RegExp('[\\p{L}\\p{N}]','u').test(before))||(after&&new RegExp('[\\p{L}\\p{N}]','u').test(after)))return null;
  return input.slice(0,at)+' '+input.slice(at+alias.length);
}
export function homeSuggestions(input:string){
 const query=input.trim().slice(0,200),key=normalize(query);
 if(key.length<2||hasNearMeIntent(query))return {stations:[] as HomeSuggestion[],regions:[] as HomeSuggestion[]};
 const stations=stationIndex.map(({station,aliases})=>{
   const alias=[...aliases].sort((a,b)=>b.length-a.length).find(a=>occurrence(query,a)!==null);
   const partial=!alias&&aliases.some(a=>normalize(a).startsWith(key));
   if(!alias&&!partial)return null;
   const remaining=alias?occurrence(query,alias)!:'';
   const parsed=new URL(homeSearchPath(remaining),'https://example.com');
   const department=parsed.pathname.split('/')[2];
   // Preserve remaining words even when they resemble a different location.
   const deptOnly=parsed;
   const safeRemaining=deptOnly.pathname.split('/')[3]==='all'?(deptOnly.searchParams.get('q')||''):remaining.trim();
   return {label:station.name_en,detail:`${station.name_ko} · ${station.city} · ${station.stations.map(s=>s.line).join(' / ')}`,href:searchLink(department,station.slug,{query:safeRemaining}),score:alias?normalize(alias).length:0};
 }).filter((s):s is HomeSuggestion&{score:number}=>s!==null).sort((a,b)=>b.score-a.score).slice(0,4);
 const matches=matchRegions(query);
 let regions=matches.options.slice(0,4).map(r=>({label:r.label,detail:'Clinics in this area',href:(()=>{const parsed=new URL(homeSearchPath(matches.query),'https://example.com');return searchLink(parsed.pathname.split('/')[2],r.slug,{query:parsed.pathname.split('/')[3]==='all'?(parsed.searchParams.get('q')||''):matches.query});})()}));
 if(!regions.length){
  regions=[...nationalProvinces,...nationalAreas].filter(a=>a.aliases.some(alias=>normalize(alias).startsWith(key))).slice(0,4).map(a=>({label:regionLabel(a.slug)!,detail:'Clinics in this area',href:searchLink('all',a.slug)}));
 }
 const interpreted=new URL(homeSearchPath(query),'https://example.com');
 const slug=interpreted.pathname.split('/')[3];
 if(['gangnam','jamsil','dongtan'].includes(slug)){regions=[{label:slug==='gangnam'?'Gangnam area (Gangnam-gu & Seocho-gu)':slug==='jamsil'?'Jamsil, Seoul':'Dongtan, Hwaseong',detail:'Clinics in this area',href:interpreted.pathname+interpreted.search}];}
 if(['강남','잠실','동탄'].includes(query)){const slug=query==='강남'?'gangnam':query==='잠실'?'jamsil':'dongtan';regions=[{label:slug==='gangnam'?'Gangnam area (Gangnam-gu & Seocho-gu)':slug==='jamsil'?'Jamsil, Seoul':'Dongtan, Hwaseong',detail:'Clinics in this area',href:searchLink('all',slug)}];}
 return {stations,regions};
}
