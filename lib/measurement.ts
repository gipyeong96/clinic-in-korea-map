export const MEASUREMENT_ID='G-0TP3EDEP3R';
export const MEASUREMENT_OPT_OUT='clinic-map-measurement-excluded';
// Only these public discovery services may identify an acquisition source.
// Never forward arbitrary referring hosts, paths, query strings or fragments.
const referrerHosts=new Set(['www.google.com','google.com','www.google.co.kr','google.co.kr','www.bing.com','bing.com','search.naver.com','m.search.naver.com','www.naver.com','naver.com','search.daum.net','www.daum.net','duckduckgo.com','www.duckduckgo.com','facebook.com','www.facebook.com','m.facebook.com','l.facebook.com','lm.facebook.com','instagram.com','www.instagram.com','l.instagram.com','threads.com','www.threads.com','l.threads.com','t.co','youtube.com','www.youtube.com','m.youtube.com','chatgpt.com','www.chatgpt.com','perplexity.ai','www.perplexity.ai','gemini.google.com','copilot.microsoft.com']);
export function measurementReferrer(referrer:string){
 try{const url=new URL(referrer);return ['https:','http:'].includes(url.protocol)&&referrerHosts.has(url.hostname)?`https://${url.hostname}/`:'';}catch{return '';}
}
const pageTitles:Record<string,string>={home:'Home',results:'Clinic search',conditions:'Condition information',profile:'Clinic profile',nearby:'Nearby search',areas:'Area directory',stations:'Station directory',guides:'Care guides',library:'Saved clinics',other:'Other'};
export function measurementCampaign(search:string){const p=new URLSearchParams(search);if(!['facebook','instagram'].includes(p.get('utm_source')||'')||p.get('utm_medium')!=='paid_social'||p.get('utm_campaign')!=='tool_intro_v1'||!['search_first','quokka_intro'].includes(p.get('utm_content')||''))return {};return {campaign_source:p.get('utm_source')!,campaign_medium:'paid_social',campaign_name:'tool_intro_v1',campaign_content:p.get('utm_content')!};}
export function measurementPage(path:string){
 if(path==='/')return 'home';
 if(path.startsWith('/clinics/detail/'))return 'profile';
 if(path==='/conditions'||path.startsWith('/conditions/'))return 'conditions';
 if(path.startsWith('/clinics/'))return 'results';
 if(path==='/nearby')return 'nearby';
 if(path.startsWith('/areas'))return 'areas';
 if(path.startsWith('/stations'))return 'stations';
 if(path.startsWith('/guides'))return 'guides';
 if(path==='/my-clinics')return 'library';
 return 'other';
}
const events=new Set(['search_submit','call_click','directions_click','clinic_save','share_request','share_complete','link_copy','compare_request']);
export function measurementPayload(event:string,path:string,referrer=''){
 if(event!=='page_view'&&!events.has(event))return null;
 const page=measurementPage(path);
 return {send_to:MEASUREMENT_ID,page_location:`https://map.clinicinkorea.com/measure/${page}`,page_referrer:measurementReferrer(referrer),page_title:`Korea Clinic Map | ${pageTitles[page]}`,page_group:page};
}
export function measurementExcluded(){try{return typeof window==='undefined'||window.location.hostname!=='map.clinicinkorea.com'||localStorage.getItem(MEASUREMENT_OPT_OUT)==='1';}catch{return true;}}
export function measure(event:string,referrer=''){
 if(measurementExcluded())return;
 const payload=measurementPayload(event,window.location.pathname,referrer);
 if(payload)(window as Window&{gtag?:(...args:unknown[])=>void}).gtag?.('event',event,payload);
}
