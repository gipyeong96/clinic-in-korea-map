import catalog from './national-areas.json';

// Imported location relations can merge homonymous neighbourhoods. Display and
// navigation must use the province-qualified source address instead.
const scopes = [...catalog.areas, ...catalog.provinces].flatMap(area =>
  area.prefixes.map(prefix => ({area, prefix}))
).sort((a,b) => b.prefix.length-a.prefix.length);

export function clinicRegion(clinic:{address_ko?:string|null}) {
  const address=(clinic.address_ko||'').trim().replace(/\s+/g,' ');
  const match=scopes.find(({prefix}) => `${address} `.startsWith(prefix));
  if(!match)return null;
  const area=match.area;
  const province='province' in area?catalog.provinces.find(p=>p.slug===area.province):null;
  const parent='parent' in area?catalog.areas.find(a=>'province' in area&&a.province===area.province&&a.ko===area.parent):null;
  return {slug:area.slug,label:[area.en,parent?.en,province?.en].filter(Boolean).join(', ')};
}
