import {unifiedClinicRecords,uniqueClinicProfiles} from './site';

// Apply the same filters to both partitions, then paginate the complete order.
// Exclude only the matched rows: no injected branches or stored flag changes.
export async function partnerFirstPage(build:()=>any,options:{offset?:number;limit?:number}){
 const hiras=unifiedClinicRecords.map(r=>r.hira);
 const ids=unifiedClinicRecords.flatMap(r=>r.aliases);
 const partnerResult=await build().or(`hira_code.in.(${hiras.join(',')}),id.in.(${ids.join(',')})`).order('is_premium',{ascending:false}).order('id').limit(100);
 if(partnerResult.error||!partnerResult.data)throw new Error('Unable to load clinics. Please try again later.');
 const partners=uniqueClinicProfiles(partnerResult.data);
 const offset=options.offset||0,limit=options.limit||100;
 const head=partners.slice(offset,offset+limit);
 if(head.length===limit)return head;
 const start=Math.max(0,offset-partners.length);
 // Read a bounded window in the existing indexed order. A NOT IN predicate here
 // makes regional scans time out. At most the finite partner-row count is extra.
 const result=await build().order('is_premium',{ascending:false}).order('id').range(start,start+limit-head.length+partnerResult.data.length-1);
 if(result.error||!result.data)throw new Error('Unable to load clinics. Please try again later.');
 const first=result.data[0];
 const compare=(a:any,b:any)=>Number(!!b.is_premium)-Number(!!a.is_premium)||String(a.id).localeCompare(String(b.id));
 const preceding=first?partnerResult.data.filter((r:any)=>compare(r,first)<0).length:0;
 const idsToRemove=new Set(partnerResult.data.map((r:any)=>r.id));
 return [...head,...result.data.filter((r:any)=>!idsToRemove.has(r.id)).slice(preceding,preceding+limit-head.length)];
}
