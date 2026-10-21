import {searchLink} from './search';
export function activeFilters(input:{department:string;location:string;query:string;specialist:boolean;radius?:number;departmentLabel:string;locationLabel:string}){
  const {department,location,query,specialist,radius,departmentLabel,locationLabel}=input;
  const options={query,specialist,radius};
  const filters:{label:string;href:string;action:string}[]=[];
  if(location!=='all')filters.push({label:locationLabel,href:searchLink(department,'all',{query,specialist}),action:'Remove location'});
  // A station search always has a radius. Offer an explicit change rather than
  // implying it can be removed while retaining the station search.
  if(radius)filters.push({label:radius===500?'500 m':`${radius/1000} km`,href:'#search-radius',action:'Change radius'});
  if(department!=='all')filters.push({label:departmentLabel,href:searchLink('all',location,options),action:'Remove department'});
  if(specialist)filters.push({label:'Specialist reported',href:searchLink(department,location,{...options,specialist:false}),action:'Remove specialist filter'});
  if(query)filters.push({label:`Keyword: ${query}`,href:searchLink(department,location,{...options,query:''}),action:'Remove keyword'});
  return {filters,clear:'/clinics/all/all'};
}
