// Only local search pages can be used as return destinations. Never accept an
// arbitrary URL from a detail-page query parameter.
export function searchReturnPath(value:unknown):string|null {
  if(typeof value!=='string'||value.length>2000||!value.startsWith('/clinics/'))return null;
  try {
    const url=new URL(value,'https://clinic.invalid');
    if(url.origin!=='https://clinic.invalid'||value.split(/[?#]/)[0]!==url.pathname||!/^\/clinics\/(?!detail\/)[a-z0-9-]+\/[a-z0-9-]+$/.test(url.pathname))return null;
    const allowed=new Set(['q','specialist','radius','page']);
    for(const key of Array.from(url.searchParams.keys())){
      if(!allowed.has(key)||url.searchParams.getAll(key).length!==1)return null;
    }
    if((url.searchParams.get('q')||'').length>200)return null;
    if(url.searchParams.has('specialist')&&url.searchParams.get('specialist')!=='1')return null;
    if(url.searchParams.has('radius')&&!['500','1000','2000'].includes(url.searchParams.get('radius')!))return null;
    if(url.searchParams.has('page')&&!/^[1-9]\d{0,3}$|^10000$/.test(url.searchParams.get('page')!))return null;
    if(url.hash&&!/^#clinic-card-[a-zA-Z0-9-]+$/.test(url.hash))return null;
    return url.pathname+url.search+url.hash;
  }catch{return null;}
}

export function clinicDetailLink(path:string,returnTo?:string,id?:string) {
  const source=searchReturnPath(returnTo);
  if(!source)return path;
  const anchor=id&&/^[a-zA-Z0-9-]+$/.test(id)?`#clinic-card-${id}`:'';
  return `${path}?returnTo=${encodeURIComponent(source.split('#')[0]+anchor)}`;
}
