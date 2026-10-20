export function cleanText(value:unknown){return typeof value==='string'?value.normalize('NFC').trim().replace(/\s+/g,' '):'';}
export function clinicName(clinic:any){return cleanText(clinic.name_en)||cleanText(clinic.name_ko)||'Clinic';}
export function clinicAddress(clinic:any){return cleanText(clinic.address_ko)||cleanText(clinic.address_en);}
export function clinicPhone(value:unknown){
  const display=cleanText(value);
  if(!display||!display.replace(/\D/g,''))return {display:'',href:null,reason:'missing'};
  if(!/^[+\d\s().-]+$/.test(display))return {display,href:null,reason:'unconfirmed'};
  const number=display.replace(/[\s().-]/g,'');
  const national=number.startsWith('+82')?'0'+number.slice(3):number;
  if(/^(?:02\d{7,8}|0(?:3[1-3]|4[1-4]|5[1-5]|6[1-4])\d{7,8}|010\d{8}|070\d{8}|080\d{7}|050[2-8]\d{7,8})$/.test(national))return {display,href:`tel:+82${national.slice(1)}`,reason:null};
  if(/^1[568]\d{6}$/.test(number))return {display,href:`tel:${number}`,reason:null};
  return {display,href:null,reason:/^\d{7,8}$/.test(number)?'area-code-missing':'unconfirmed'};
}
export function hasClinicCoordinates(clinic:any){return typeof clinic.latitude==='number'&&typeof clinic.longitude==='number'&&clinic.latitude>=33&&clinic.latitude<=39&&clinic.longitude>=124&&clinic.longitude<=132&&!(clinic.latitude===37.5665&&clinic.longitude===126.9780);}
export function clinicDirections(clinic:any){
  const destination=hasClinicCoordinates(clinic)?`${clinic.latitude},${clinic.longitude}`:clinicAddress(clinic);
  return destination?`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`:null;
}
