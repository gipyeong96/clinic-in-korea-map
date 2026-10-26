// Use the province-qualified source address, never a clinic name or merged dong.
export function isJamsilDong(address:unknown){
 if(typeof address!=='string')return false;
 const normalized=address.trim().replace(/\s+/g,' ');
 return /^(?:서울특별시|서울) 송파구 /.test(normalized)&&/\(잠실동(?:[,\s)]|$)/.test(normalized);
}
