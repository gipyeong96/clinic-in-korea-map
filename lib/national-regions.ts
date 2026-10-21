import catalog from './national-areas.json';
export const nationalAreas=catalog.areas;
export const nationalProvinces=catalog.provinces;
export type Area = typeof nationalAreas[number];
const reserved=new Set(['gangnam','강남','jamsil','잠실','dongtan','동탄','jung','중','seo','서','dong','동','nam','남','buk','북']);
type Token={value:string;start:number;end:number};
const aliasTokens=new Map<string,string[]>();
function tokens(input:string):Token[]{return Array.from(input.matchAll(new RegExp('[\\p{L}\\p{N}]+','gu'))).map(m=>({value:m[0].toLowerCase(),start:m.index!,end:m.index!+m[0].length}));}
function bestMatch(input:string,words:Token[],aliases:string[],province=false){
  let best:{0:string;index:number}|undefined;
  for(const alias of aliases){
    let parts=aliasTokens.get(alias);if(!parts){parts=tokens(alias).map(t=>t.value);aliasTokens.set(alias,parts);}
    for(let i=0;i<=words.length-parts.length;i++){
      if(!parts.every((p,j)=>p===words[i+j].value))continue;
      if(['si','gun','gu'].includes(words[i+parts.length]?.value))continue;
      const text=input.slice(words[i].start,words[i+parts.length-1].end);
      if(!best||text.length>best[0].length)best={0:text,index:words[i].start};
    }
  }
  return best;
}
export function regionLabel(slug:string){
  const p=nationalProvinces.find(p=>p.slug===slug);
  if(p)return `${p.en} · ${p.ko}`;
  const a=nationalAreas.find(a=>a.slug===slug);
  if(!a)return null;
  const province=nationalProvinces.find(p=>p.slug===a.province)!;
  const parent='parent' in a?a.parent:undefined;
  return `${a.en}${parent?`, ${nationalAreas.find(x=>x.province===a.province&&x.ko===parent)?.en||parent}`:''}, ${province.en} · ${a.ko}`;
}
export function matchRegions(input:string):{options:{slug:string;label:string}[];query:string}{
  if(/\bstation\b|역(?:\s|$)/i.test(input))return {options:[],query:input};
  const words=tokens(input);
  const ps=nationalProvinces.map(p=>({p,m:bestMatch(input,words,p.aliases,true)})).filter(x=>x.m);
  let candidates=nationalAreas.map(a=>({a,m:bestMatch(input,words,a.aliases.filter(alias=>!reserved.has(alias.toLowerCase())||ps.some(p=>p.p.slug===a.province)))})).filter(x=>x.m);
  if(ps.length)candidates=candidates.filter(x=>ps.some(p=>p.p.slug===x.a.province));
  // Bare province names keep existing meanings (Gwangju metro, Jeju province).
  if(ps.length===1&&(candidates.length===0||candidates.every(x=>x.m!.index===ps[0].m!.index&&x.m![0].length<=ps[0].m![0].length))){
    const {p,m}=ps[0];return {options:[{slug:p.slug,label:regionLabel(p.slug)!}],query:input.replace(m![0],' ').trim().replace(/\s+/g,' ')};
  }
  candidates=candidates.filter(x=>!ps.some(p=>p.m!.index===x.m!.index&&p.m![0].length>=x.m![0].length));
  const allCandidates=candidates;
  candidates=candidates.filter(x=>!candidates.some(y=>'parent' in y.a&&y.a.parent===x.a.ko&&y.a.province===x.a.province));
  // Two different requested cities are not silently converted to one city.
  if(new Set(candidates.map(x=>`${x.m!.index}:${x.m![0].toLowerCase()}`)).size>1)return {options:[],query:input};
  if(!candidates.length)return {options:[],query:input};
  let query=input;
  for(const x of allCandidates)query=query.replace(x.m![0],' ');
  for(const x of ps)query=query.replace(x.m![0],' ');
  return {options:candidates.map(x=>({slug:x.a.slug,label:regionLabel(x.a.slug)!})),query:query.trim().replace(/\s+/g,' ')};
}
