import labels from './department-labels.json';
import {searchLink} from './search';
export type AreaContext={department:string;query:string;specialist:boolean;registered?:boolean;weekend?:string};
export function areaContext(params:Record<string,unknown>={}):AreaContext {
 const department=typeof params.department==='string'&&(params.department==='all'||Object.prototype.hasOwnProperty.call(labels,params.department))?params.department:'all';
 return {department,query:typeof params.q==='string'?params.q.trim().slice(0,200):'',specialist:params.specialist==='1',...(params.registered==='1'?{registered:true}:{}),...(params.weekend==='saturday'||params.weekend==='sunday'?{weekend:params.weekend}:{})};
}
export function areaBrowseLink(province:string|undefined,context:AreaContext){
 const params=new URLSearchParams();if(context.department!=='all')params.set('department',context.department);if(context.query)params.set('q',context.query);if(context.specialist)params.set('specialist','1');if(context.registered)params.set('registered','1');if(context.weekend)params.set('weekend',context.weekend);
 return `/areas${province?`/${province}`:''}${params.size?'?'+params.toString():''}`;
}
export function areaClinicLink(location:string,context:AreaContext){return searchLink(context.department,location,{query:context.query,specialist:context.specialist,registered:context.registered,weekend:context.weekend});}
