import {nationalAreas,nationalProvinces} from './national-regions';

export type LocationNameRow={id:number;parent_id:number|null;slug:string;name_ko:string;name_en:string|null};

// Labels follow stored parent IDs, never clinic samples or matching dong names.
export function locationHierarchyLabel(rows:LocationNameRow[],slug:string):string|null {
 const chain:LocationNameRow[]=[];const seen=new Set<number>();
 let row=rows.find(r=>r.slug===slug);
 while(row){
  if(seen.has(row.id)||chain.length>=6)return null;
  chain.push(row);seen.add(row.id);
  if(row.parent_id===null)break;
  row=rows.find(r=>r.id===row!.parent_id);
  if(!row)return null;
 }
 if(!chain.length)return null;
 const root=chain[chain.length-1];
 const province=nationalProvinces.find(p=>p.aliases.includes(root.name_ko));
 if(!province)return null;
 const parts=chain.map((item,index)=>{
  if(item.id===root.id&&province)return province.en;
  const parent=chain[index+1];
  const area=province&&nationalAreas.find(a=>a.province===province.slug&&a.ko===item.name_ko&&('parent' in a?a.parent===parent?.name_ko:parent?.id===root.id));
  if(area)return area.en;
  const english=item.name_en?.trim();
  if(english&&/^[a-z][a-z\d\s.'()-]*$/i.test(english)){
   const suffix=[['동','dong'],['읍','eup'],['면','myeon'],['리','ri']].find(([ko])=>item.name_ko.endsWith(ko));
   const readable=suffix&&!english.includes('-')?english.replace(new RegExp(`(.+)(${suffix[1]})$`,'i'),'$1-$2'):english;
   return readable.replace(/\b[a-z]/g,c=>c.toUpperCase()).replace(/-(Dong|Eup|Myeon|Ri)\b/g,m=>m.toLowerCase());
  }
  return item.name_ko?.trim()||null;
 });
 return parts.every(Boolean)?parts.join(', '):null;
}
