import {nationalAreas,nationalProvinces} from './national-regions';
export type WeekendCoverage = 'pilot' | 'limited' | 'outside';
// Coverage describes the imported pilot, never whether a clinic is open.
export function weekendCoverage(slug:string,label:string,station=false):WeekendCoverage {
  if(station)return 'limited'; // A radius can cross administrative boundaries.
  if(['gangnam','jamsil','area-seoul-gangnam-gu','area-seoul-seocho-gu'].includes(slug))return 'pilot';
  if(['all','seoul','area-seoul-songpa-gu'].includes(slug))return 'limited';
  const area=nationalAreas.find(a=>a.slug===slug);
  const province=nationalProvinces.find(p=>p.slug===slug);
  if(area||province)return 'outside';
  // Require the full hierarchy; Sincheon-dong alone also exists outside Seoul.
  if(/\bSeoul\b/i.test(label)) {
    if(/\b(Gangnam-gu|Seocho-gu)\b/i.test(label))return 'pilot';
    if(/\bSongpa-gu\b/i.test(label)&&/\b(Jamsil-dong|Sincheon-dong)\b/i.test(label))return 'pilot';
    return 'limited';
  }
  if(nationalProvinces.some(p=>p.slug!=='seoul'&&label.toLowerCase().split(/[,·]/).some(part=>part.trim()===p.en.toLowerCase())))return 'outside';
  return 'limited';
}
export function weekendCoverageCopy(coverage:WeekendCoverage){
  return coverage==='outside'
    ? {title:'Weekend hours are not covered in this area',description:'Our current weekend dataset does not cover this area. This does not mean local clinics are closed.'}
    : coverage==='pilot'
    ? {title:'Weekend hours: partial records',description:'This area is included in our pilot. Only clinics with recorded hours for the selected day appear; missing hours do not mean closed.'}
    : {title:'Weekend hours: limited area coverage',description:'Only recorded hours in Gangnam-gu, Seocho-gu, Jamsil-dong and Sincheon-dong, Seoul are included. Missing results do not mean local clinics are closed.'};
}
