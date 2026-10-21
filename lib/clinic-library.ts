export type LibraryClinic={id:string;path:string;name:string;nameKo:string;address:string;region:string};
export const LIBRARY_KEY='korea-clinic-map:library:v1';
export type ClinicLibrary={saved:LibraryClinic[];recent:LibraryClinic[]};
export function clinicSnapshot(clinic:any):LibraryClinic {
  return {id:String(clinic.id),path:`/clinics/detail/${encodeURIComponent(clinic.hira_code||clinic.id)}`,name:(clinic.name_en||clinic.name_ko||'Clinic').trim(),nameKo:clinic.name_ko||'',address:clinic.address_ko||clinic.address_en||'',region:clinic.address_region?.label||''};
}
export function readLibrary(raw:string|null):ClinicLibrary {
  try{
    const data=JSON.parse(raw||'{}');
    const clean=(value:unknown,limit:number):LibraryClinic[]=>{
      if(!Array.isArray(value))return [];
      const seen=new Set();
      return value.filter(c=>c&&typeof c.id==='string'&&c.id.length<=200&&typeof c.path==='string'&&/^\/clinics\/detail\/[A-Za-z0-9%_-]+$/.test(c.path)&&['name','nameKo','address','region'].every(k=>typeof c[k]==='string'&&c[k].length<=1000)&&!seen.has(c.id)&&seen.add(c.id)).slice(0,limit);
    };
    return {saved:clean(data?.saved,100),recent:clean(data?.recent,20)};
  }catch{return {saved:[],recent:[]};}
}
export function updateLibrary(library:ClinicLibrary,clinic:LibraryClinic,action:'save'|'visit'|'remove-recent'):ClinicLibrary {
  if(action==='visit')return {...library,recent:[clinic,...library.recent.filter(c=>c.id!==clinic.id)].slice(0,20)};
  if(action==='remove-recent')return {...library,recent:library.recent.filter(c=>c.id!==clinic.id)};
  const exists=library.saved.some(c=>c.id===clinic.id);
  // Do not silently evict an existing saved clinic when storage is full.
  return {...library,saved:exists?library.saved.filter(c=>c.id!==clinic.id):library.saved.length<100?[clinic,...library.saved]:library.saved};
}
