import {searchLink} from './search';
export function activeSearchSummary(input:Parameters<typeof activeFilters>[0]){
 return [input.department==='all'?'All departments':input.departmentLabel,input.location==='all'?'Across Korea':input.locationLabel,input.radius?`Within ${input.radius===500?'500 m':`${input.radius/1000} km`}`:null,input.specialist?'Specialists reported':null,input.registered?'International-patient registration listed':null,input.query?`Keyword: ${input.query}`:null].filter(Boolean).join(' · ');
}
export function activeFilters(input:{department:string;location:string;query:string;specialist:boolean;registered?:boolean;radius?:number;departmentLabel:string;locationLabel:string}){
  const {department,location,query,specialist,registered,radius,departmentLabel,locationLabel}=input;
  const options={query,specialist,registered,radius};
  const filters:{label:string;href:string;action:string}[]=[];
  if(location!=='all')filters.push({label:locationLabel,href:searchLink(department,'all',{query,specialist,registered}),action:'Remove location'});
  // A station search always has a radius. Offer an explicit change rather than
  // implying it can be removed while retaining the station search.
  if(radius)filters.push({label:radius===500?'500 m':`${radius/1000} km`,href:'#search-radius',action:'Change radius'});
  if(department!=='all')filters.push({label:departmentLabel,href:searchLink('all',location,options),action:'Remove department'});
  if(registered)filters.push({label:'Registered for international patients',href:searchLink(department,location,{...options,registered:false}),action:'Remove registration filter'});
  if(specialist)filters.push({label:'Specialist reported',href:searchLink(department,location,{...options,specialist:false}),action:'Remove specialist filter'});
  if(query)filters.push({label:`Keyword: ${query}`,href:searchLink(department,location,{...options,query:''}),action:'Remove keyword'});
  return {filters,clear:'/clinics/all/all'};
}
