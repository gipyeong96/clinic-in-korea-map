import {extractRegion} from './regions';
const nearMePattern=/\b(?:near[\s-]+me|around\s+me|nearby)\b/gi;
export function hasNearMeIntent(input:string){return new RegExp(nearMePattern.source,'i').test(input);}
export function nearbyKeyword(input:string){return input.slice(0,200).replace(nearMePattern,' ').replace(/\b(?:clinics?|hospitals?)\b/gi,' ').trim().replace(/\s+/g,' ');}
export function nearbySearchLink(department:string,options:{query?:string;specialist?:boolean;registered?:boolean;radius?:number}={}){
 const params=new URLSearchParams();
 if(department!=='all')params.set('department',department);
 if(options.query)params.set('q',options.query);
 if(options.specialist)params.set('specialist','1');
 if(options.registered)params.set('registered','1');
 if(options.radius)params.set('radius',String(options.radius));
 return `/nearby${params.size?'?'+params.toString():''}`;
}
export function searchLink(department:string,location:string,options:{query?:string;specialist?:boolean;registered?:boolean;radius?:number;page?:number}={}) {
  const params=new URLSearchParams();
  if(options.query)params.set('q',options.query);
  if(options.specialist)params.set('specialist','1');
  if(options.registered)params.set('registered','1');
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
    [/\b(?:urology|urologists?)\b/, 'urology'],
    [/\b(?:dentistry|dental|dentists?)\b/, 'dentistry'],
    [/\binternal(?:[ -]+medicine)?\b/, 'internal-medicine'],
    [/\b(?:dermatology|dermatologists?|skin[ -]+(?:doctors?|clinics?))\b/, 'dermatology'],
    [/\bplastic(?:[ -]+surgery)?\b/, 'plastic-surgery'],
    [/\b(?:ent(?:[ -]+doctors?)?|ear[ ,–-]+nose[ ,–-]+(?:and[ -]+)?throat(?:[ -]+(?:doctors?|clinics?))?|otolaryngology)\b/, 'ent'],
    [/\b(?:pediatrics|pediatricians?|paediatrics|paediatricians?|(?:kids?|children(?:['’]s)?)[ -]+(?:doctors?|clinics?))\b/, 'pediatrics'],
    [/\b(?:ob[ -]?gyn|gynecology|gynaecology|gynecologists?|gynaecologists?|obstetrics)\b/, 'ob-gyn'],
    [/\b(?:orthopedics|orthopaedics|orthopedist)\b/, 'orthopedics'],
    [/\b(?:ophthalmology|ophthalmologists?|eye[ -]+(?:doctors?|clinics?))\b/, 'ophthalmology'],
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
    if (pattern.test(remaining)) {
      department = slug;
      // Consume only a connector immediately after the department phrase.
      // Keep "near me" intact and preserve other words such as "walk in".
      remaining=remaining.replace(new RegExp(pattern.source+'(?:\\s+(?:in|at|near)\\b(?![\\s-]+me\\b))?'), ' ');
      break;
    }
  }
  if(hasNearMeIntent(remaining))return nearbySearchLink(department,{query:nearbyKeyword(remaining)});
  const region=extractRegion(remaining);
  if(region&&!/\bstation\b|역/.test(remaining)){location=region.slug;remaining=region.query;}
  for (const [pattern, slug] of locations) {
    if(location!=='all')break;
    if (pattern.test(remaining)) { location = slug; remaining = remaining.replace(pattern, ' '); break; }
  }
  // Generic directory words are not clinic-name constraints after a department
  // has been recognized. Preserve names and other qualifiers in mixed phrases.
  if(department!=='all'&&/^(?:\s*(?:clinics?|hospitals?|in|at|near)\b\s*)+$/i.test(remaining))remaining='';
  const query = remaining.trim().replace(/\s+/g, ' ');
  return `/clinics/${department}/${location}${query ? `?q=${encodeURIComponent(query)}` : ''}`;
}

export function searchTerms(input: string) {
  // Avoid PostgREST operators and wildcard characters being interpreted as query syntax.
  return input.slice(0, 200).replace(/[,%_()*\\.\":]/g, ' ').trim().split(/\s+/).filter(Boolean);
}
