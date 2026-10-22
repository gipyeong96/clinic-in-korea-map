export const MEASUREMENT_ID='G-0TP3EDEP3R';
export const MEASUREMENT_OPT_OUT='clinic-map-measurement-excluded';
export function measurementCampaign(search:string){const p=new URLSearchParams(search);if(!['facebook','instagram'].includes(p.get('utm_source')||'')||p.get('utm_medium')!=='paid_social'||p.get('utm_campaign')!=='tool_intro_v1'||!['search_first','quokka_intro'].includes(p.get('utm_content')||''))return {};return {campaign_source:p.get('utm_source')!,campaign_medium:'paid_social',campaign_name:'tool_intro_v1',campaign_content:p.get('utm_content')!};}
export function measurementPage(path:string){
 if(path==='/')return 'home';
 if(path.startsWith('/clinics/detail/'))return 'profile';
 if(path.startsWith('/clinics/'))return 'results';
 if(path==='/nearby')return 'nearby';
 if(path.startsWith('/areas'))return 'areas';
 if(path.startsWith('/stations'))return 'stations';
 if(path.startsWith('/guides'))return 'guides';
 if(path==='/my-clinics')return 'library';
 return 'other';
}
const events=new Set(['search_submit','call_click','directions_click','clinic_save','share_request','share_complete','link_copy','compare_request']);
export function measurementPayload(event:string,path:string){
 if(event!=='page_view'&&!events.has(event))return null;
 const page=measurementPage(path);
 return {send_to:MEASUREMENT_ID,page_location:`https://map.clinicinkorea.com/measure/${page}`,page_referrer:'',page_title:'Korea Clinic Map',page_group:page};
}
export function measurementExcluded(){try{return typeof window==='undefined'||window.location.hostname!=='map.clinicinkorea.com'||localStorage.getItem(MEASUREMENT_OPT_OUT)==='1';}catch{return true;}}
export function measure(event:string){
 if(measurementExcluded())return;
 const payload=measurementPayload(event,window.location.pathname);
 if(payload)(window as Window&{gtag?:(...args:unknown[])=>void}).gtag?.('event',event,payload);
}
