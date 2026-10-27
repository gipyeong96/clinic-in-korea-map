import {goldmanBranch} from './goldman';
export const urologyAreas:Record<string,{title:string;description:string;scope:string;branches:string[]}>= {
 'jamsil-station':{title:'Jamsil Urology Clinics: Compare near Jamsil Station, Seoul',description:'Compare urology clinics near Jamsil Station, including Goldman Jamsil. Check station distance, reported specialists, contact details and English website links.',scope:'The default search covers 1 km around Jamsil Station. This radius crosses neighbourhood boundaries and can include Sincheon-dong and parts of Jamsil-dong; it is not all of either neighbourhood.',branches:['goldman-jamsil']},
 'jamsil':{title:'Urology Clinics in Jamsil-dong: Compare Local Options',description:'Compare urology clinics in Jamsil-dong, Seoul. For Goldman Jamsil and other clinics in nearby Sincheon-dong, browse the Jamsil Station comparison.',scope:'Jamsil-dong is an address area. Goldman Jamsil is in neighbouring Sincheon-dong; use the station comparison to explore that part of Jamsil.',branches:[]},
 'gangnam':{title:'Gangnam Urology Clinics: Compare Clinics & Visit Details',description:'Compare urology clinics across Gangnam-gu and Seocho-gu, Seoul, including Goldman Gangnam. Check reported specialists, locations and visit details.',scope:'This Gangnam area search includes Gangnam-gu and Seocho-gu. Goldman Gangnam is in Seocho-gu, with published access from Yangjae Station.',branches:['goldman-gangnam']},
 'area-seoul-seocho-gu':{title:'Seocho Urology Clinics: Compare Locations & Specialists',description:'Compare urology clinics in Seocho-gu, Seoul, including Goldman Gangnam near Yangjae Station. Check specialist records, addresses and branch contact details.',scope:'Results cover Seocho-gu, not only Seocho-dong. Goldman Gangnam is a branch name; its address is in Seocho-gu.',branches:['goldman-gangnam']},
 'incheon':{title:'Incheon Urology Clinics: Compare Locations & Visit Details',description:'Compare urology clinics across Incheon. Explore Goldman Incheon in the Guwol-dong area near Arts Center Station, plus public clinic records and contact details.',scope:'Incheon results cover the whole city. For a Guwol-dong visit, check the address and station access; Goldman Incheon publishes directions from Arts Center Station.',branches:['goldman-incheon']},
 'area-incheon-namdong-gu':{title:'Namdong-gu Urology Clinics: Guwol-dong & Nearby Areas',description:'Compare urology clinics across Namdong-gu, Incheon, including the Guwol-dong area. Explore Goldman Incheon visit information near Arts Center Station.',scope:'This is a Namdong-gu district search, including Guwol-dong and other neighbourhoods. It is not a Guwol-dong-only list.',branches:['goldman-incheon']},
 'dongtan':{title:'Dongtan Urology Clinics: Compare Locations & Visit Details',description:'Compare Dongtan urology clinic records and explore Goldman Dongtan near Dongtan Station. Check addresses, reported specialists and branch-specific opening hours.',scope:'Dongtan is in Hwaseong, Gyeonggi-do. Check each source address and travel route; clinics in the wider Dongtan area are not all walking distance from Dongtan Station.',branches:['goldman-dongtan']},
 'seoul-station':{title:'Urology Clinics near Seoul Station: Compare Nearby Options',description:'Compare urology clinics near Seoul Station, including Goldman Seoul Station. Check straight-line distance, reported specialists and branch visit information.',scope:'The default search covers 1 km around Seoul Station, not all of Seoul. Goldman Seoul Station publishes access from Line 1, Exit 3.',branches:['goldman-seoulyeok']},
 'seoul':{title:'Seoul Urology Clinics: Compare by Area & Station',description:'Compare urology clinics across Seoul. Browse Gangnam, Seocho, Jamsil and Seoul Station, with Goldman branch visit guides and public clinic records.',scope:'Seoul is a city-wide search. Narrow to a neighbourhood or station before comparing travel distance and clinic information.',branches:['goldman-gangnam','goldman-jamsil','goldman-seoulyeok']},
};
export const urologyAreaLinks=[['seoul','Seoul'],['gangnam','Gangnam'],['area-seoul-seocho-gu','Seocho'],['jamsil-station','Jamsil Station'],['seoul-station','Seoul Station'],['incheon','Incheon'],['area-incheon-namdong-gu','Guwol-dong / Namdong-gu'],['dongtan','Dongtan']];
export const goldmanComparison:Record<string,string>={'goldman-jamsil':'jamsil-station','goldman-gangnam':'gangnam','goldman-incheon':'incheon','goldman-dongtan':'dongtan','goldman-seoulyeok':'seoul-station'};
export function goldmanSearchMetadata(id:string){
 const branch=goldmanBranch(id);if(!branch)return undefined;
 const place=branch.id==='goldman-incheon'?'Guwol-dong, Incheon':branch.id==='goldman-gangnam'?'Seocho-gu, Seoul':branch.id==='goldman-dongtan'?'Hwaseong': 'Seoul';
 return {title:`Goldman Urology ${branch.name} — ${place} | Korea Clinic Map`,description:`Plan a visit to Goldman Urology ${branch.name}: ${branch.address}. Find the branch phone, station access, opening hours, official English website and local clinic comparison.`};
}
// Address evidence, never the hospital name, determines the local comparison.
export function urologyComparisonForAddress(value:unknown){
 const address=typeof value==='string'?value.trim().replace(/\s+/g,' '):'';
 if(/^(?:서울특별시|서울) 송파구 /.test(address)&&/\((?:잠실동|신천동)(?:[,\s)]|$)/.test(address))return 'jamsil-station';
 if(/^(?:서울특별시|서울) 서초구 /.test(address))return 'area-seoul-seocho-gu';
 if(/^(?:서울특별시|서울) 강남구 /.test(address))return 'gangnam';
 if(/^(?:인천광역시|인천) 남동구 /.test(address))return 'area-incheon-namdong-gu';
 if(/^(?:인천광역시|인천) /.test(address))return 'incheon';
 if(/^(?:경기도|경기) 화성시 .*동탄/.test(address))return 'dongtan';
 if(/^(?:서울특별시|서울) /.test(address))return 'seoul';
 return undefined;
}
