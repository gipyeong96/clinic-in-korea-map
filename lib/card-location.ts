export function cardAddress(clinic:{address_en?:unknown;address_ko?:unknown}){
 const clean=(value:unknown)=>typeof value==='string'?value.trim():'';
 return {primary:clean(clinic.address_en)||clean(clinic.address_ko),korean:clean(clinic.address_ko)};
}
export function nearbyStation(clinic:{latitude?:number;longitude?:number},stations:ReadonlyArray<{slug:string;name_en:string;stations:ReadonlyArray<{latitude:number;longitude:number}>}>){
 const {latitude:lat,longitude:lng}=clinic;
 if(typeof lat!=='number'||typeof lng!=='number'||!Number.isFinite(lat)||!Number.isFinite(lng)||lat<33||lat>39||lng<124||lng>132||(lat===37.5665&&lng===126.978))return null;
 const rad=(v:number)=>v*Math.PI/180;
 let nearest:{name:string;slug:string;distance:number}|null=null;
 for(const station of stations)for(const point of station.stations){
  const a=Math.sin(rad(point.latitude-lat)/2)**2+Math.cos(rad(lat))*Math.cos(rad(point.latitude))*Math.sin(rad(point.longitude-lng)/2)**2;
  const distance=6371000*2*Math.asin(Math.sqrt(Math.min(1,a)));
  if(distance<=2000&&(!nearest||distance<nearest.distance))nearest={name:station.name_en,slug:station.slug,distance};
 }
 return nearest;
}
