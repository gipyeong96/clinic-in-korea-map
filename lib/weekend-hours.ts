import records from './weekend-hours-pilot.json';

type Hours = {status:string;start?:string;end?:string};
type Record = {name:string;address:string;telephone:string;checkedAt:string;saturday:Hours;sunday:Hours};
const normalize=(value:string)=>value.replace(/[^가-힣a-zA-Z0-9]/g,'').toLowerCase();
const road=(value:string)=>normalize(value.split(',')[0].split('(')[0]);
export function weekendHours(id:string,name:string,address:string,telephone:string){
 const record=(records as {[key:string]:Record})[id];
 if(!record||normalize(record.name)!==normalize(name)||road(record.address)!==road(address)||record.telephone.replace(/\D/g,'')!==telephone.replace(/\D/g,''))return null;
 return record;
}
export function hoursLabel(hours:Hours){
 const valid=(v?:string)=>!!v&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
 return hours.status==='reported_schedule'&&valid(hours.start)&&valid(hours.end)&&hours.start!<hours.end! ? `${hours.start}–${hours.end}`:'Hours not provided';
}
