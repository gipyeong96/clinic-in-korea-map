import {extractRegion} from './regions';
export function searchLink(department:string,location:string,options:{query?:string;specialist?:boolean;radius?:number;page?:number}={}) {
  const params=new URLSearchParams();
  if(options.query)params.set('q',options.query);
  if(options.specialist)params.set('specialist','1');
  if(options.radius)params.set('radius',String(options.radius));
  if(options.page&&options.page>1)params.set('page',String(options.page));
  return `/clinics/${department}/${location}${params.size?'?'+params.toString():''}`;
}
// Match complete words and preserve unrecognized terms instead of silently dropping them.
export function homeSearchPath(input: string) {
  let remaining = input.trim().toLowerCase().slice(0, 200);
  let department = 'all';
  let location = 'all';
  const departments: [RegExp, string][] = [
    [/\b(?:urology|urologist)\b/, 'urology'],
    [/\b(?:dentistry|dental|dentist)\b/, 'dentistry'],
    [/\binternal(?:[ -]+medicine)?\b/, 'internal-medicine'],
    [/\b(?:dermatology|dermatologist)\b/, 'dermatology'],
    [/\bplastic(?:[ -]+surgery)?\b/, 'plastic-surgery'],
    [/\b(?:ent|ear nose throat|otolaryngology)\b/, 'ent'],
    [/\b(?:pediatrics|pediatrician|paediatrics)\b/, 'pediatrics'],
    [/\b(?:ob[ -]?gyn|gynecology|gynaecology|obstetrics)\b/, 'ob-gyn'],
    [/\b(?:orthopedics|orthopaedics|orthopedist)\b/, 'orthopedics'],
    [/\b(?:ophthalmology|ophthalmologist|eye clinic)\b/, 'ophthalmology'],
  ];
  const locations: [RegExp, string][] = [
    [/\bgangnam[ -]+station\b/, 'gangnam-station'],
    [/\bjamsil[ -]+station\b/, 'jamsil-station'],
    [/\bseoul[ -]+station\b/, 'seoul-station'],
    [/\bgangnam\b/, 'gangnam'], [/\bjamsil\b/, 'jamsil'],
    [/\bincheon\b/, 'incheon'], [/\bdongtan\b/, 'dongtan'],
    [/\bseoul\b/, 'seoul'],
    [/\bbusan\b/, 'busan'], [/\bdaegu\b/, 'daegu'],
    [/\bdaejeon\b/, 'daejeon'], [/\bgwangju\b/, 'gwangju'],
    [/\bulsan\b/, 'ulsan'], [/\bjeju\b/, 'jeju'],
  ];
  for (const [pattern, slug] of departments) {
    if (pattern.test(remaining)) { department = slug; remaining = remaining.replace(pattern, ' '); break; }
  }
  const region=extractRegion(remaining);
  if(region&&!/\bstation\b|역/.test(remaining)){location=region.slug;remaining=region.query;}
  for (const [pattern, slug] of locations) {
    if(location!=='all')break;
    if (pattern.test(remaining)) { location = slug; remaining = remaining.replace(pattern, ' '); break; }
  }
  const query = remaining.trim().replace(/\s+/g, ' ');
  return `/clinics/${department}/${location}${query ? `?q=${encodeURIComponent(query)}` : ''}`;
}

export function searchTerms(input: string) {
  // Avoid PostgREST operators and wildcard characters being interpreted as query syntax.
  return input.slice(0, 200).replace(/[,%_()*\\.\":]/g, ' ').trim().split(/\s+/).filter(Boolean);
}
