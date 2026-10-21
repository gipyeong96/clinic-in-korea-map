import {searchLink} from './search';
export function searchRecovery(input:{department:string;location:string;query:string;specialist:boolean;radius?:number;page:number}){
  const {department,location,query,specialist,radius,page}=input;
  const options={query,specialist,radius};
  const links:{label:string;href:string}[]=[];
  if(page>1)links.push({label:'Back to the first page',href:searchLink(department,location,options)});
  if(radius&&radius<2000){const wider=radius===500?1000:2000;links.push({label:`Expand radius to ${wider/1000} km`,href:searchLink(department,location,{...options,radius:wider})});}
  if(specialist)links.push({label:'Remove specialist filter',href:searchLink(department,location,{...options,specialist:false})});
  if(department!=='all')links.push({label:'Search all departments',href:searchLink('all',location,options)});
  if(query)links.push({label:'Clear keyword',href:searchLink(department,location,{...options,query:''})});
  links.push({label:radius?'Choose another station':'Choose another area',href:radius?'/#station-search':'/areas'});
  return links;
}
