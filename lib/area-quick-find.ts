export type AreaItem={id:string;en:string;ko:string;href:string;children?:AreaItem[]};
const normalize=(value:string)=>value.toLowerCase().replace(/[\s-]+/g,'');
export function findAreas(items:AreaItem[],query:string):AreaItem[]{
 const needle=normalize(query.trim());
 const matches=(item:AreaItem)=>normalize(item.en).includes(needle)||normalize(item.ko).includes(needle);
 return items.map(item=>({...item,children:findAreas(item.children||[],matches(item)?'':query)}))
 .filter(item=>matches(item)||item.children.length>0)
 .sort((a,b)=>a.en.localeCompare(b.en,'en',{sensitivity:'base',numeric:true}));
}
