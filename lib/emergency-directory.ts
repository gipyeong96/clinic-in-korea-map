import snapshot from './emergency-directory.json';
import regions from './national-areas.json';
export const emergencySource=snapshot.source;
export const emergencyCheckedAt=snapshot.checkedAt;
export const emergencyRecords=snapshot.records;
export const emergencyClasses=[
 {code:'G001',en:'Regional emergency medical center',ko:'권역응급의료센터'},
 {code:'G006',en:'Local emergency medical center',ko:'지역응급의료센터'},
 {code:'G007',en:'Local emergency medical institution',ko:'지역응급의료기관'},
 {code:'G009',en:'Reported ER operating institution',ko:'응급실운영신고기관'},
];
export const emergencyRegions=regions.provinces.map(p=>({...p,count:emergencyRecords.filter(r=>r.region===p.slug).length}));
export function emergencyPhone(value:string){const digits=value.replace(/[\s()-]/g,'');return /^0\d{8,10}$/.test(digits)?`tel:+82${digits.slice(1)}`:null;}
type Query={region?:string;district?:string;type?:string;page?:string};
export function emergencySearch(query:Query){
 const region=emergencyRegions.find(r=>r.slug===query.region);
 const districts=region?Array.from(new Set(emergencyRecords.filter(r=>r.region===region.slug).map(r=>r.district))).sort((a,b)=>a.localeCompare(b,'ko')):[];
 const valid=(!query.region||!!region)&&(!query.district||districts.includes(query.district))&&(!query.type||emergencyClasses.some(c=>c.code===query.type));
 const matches=valid&&region?emergencyRecords.filter(r=>r.region===region.slug&&(!query.district||r.district===query.district)&&(!query.type||r.classCode===query.type)).sort((a,b)=>a.nameKo.localeCompare(b.nameKo,'ko')||a.id.localeCompare(b.id)):[];
 const pages=Math.max(1,Math.ceil(matches.length/20)),page=/^[1-9]\d{0,5}$/.test(query.page||'')?Math.min(Number(query.page),pages):1;
 return {region,districts,valid,total:matches.length,pages,page,records:matches.slice((page-1)*20,page*20)};
}
export function emergencyPath(query:Query){const p=new URLSearchParams();for(const key of ['region','district','type','page'] as const)if(query[key])p.set(key,query[key]!);return '/emergency'+(p.size?'?'+p.toString():'');}
