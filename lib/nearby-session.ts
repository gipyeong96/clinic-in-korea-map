// Client-only, one-use navigation memory. Never persist coordinates to storage or URLs.
import type {NearbyOptions} from './nearby';
export type NearbySession=NearbyOptions&{initialKey:string;position:{latitude:number;longitude:number;accuracy:number};page:number;results:any[];hasNext:boolean;keyword:string;clinicId:string};
let saved:{at:number;value:NearbySession}|null=null;
let expiry:ReturnType<typeof setTimeout>|null=null;
export function rememberNearby(value:NearbySession){if(expiry)clearTimeout(expiry);saved={at:Date.now(),value};expiry=setTimeout(()=>{saved=null;expiry=null;},15*60*1000);}
export function takeNearby(){const entry=saved;saved=null;if(expiry)clearTimeout(expiry);expiry=null;return entry&&Date.now()-entry.at<15*60*1000?entry.value:null;}
