import {searchLink,homeSearchPath} from './search';
import labels from './department-labels.json';
import {areaBrowseLink} from './area-navigation';
export function searchRecovery(input:{department:string;location:string;query:string;specialist:boolean;registered?:boolean;weekend?:string;radius?:number;page:number;departmentLabel?:string;locationLabel?:string}){
  const {department,location,query,specialist,registered,weekend,radius,page}=input;
  const options={query,specialist,registered,weekend,radius};
  const links:{label:string;href:string;title?:string;description:string}[]=[];
  const departmentName=department==='all'?'All departments':input.departmentLabel||(labels as Record<string,string>)[department]||'All departments';
  const place=location==='all'?'across Korea':`in ${input.locationLabel||'this area'}`;
  if(page>1)links.push({label:'Back to the first page',href:searchLink(department,location,options),description:'Keep these search options and return to page 1.'});
  const parsed=new URL(homeSearchPath(query),'https://example.com');
  const inferred=parsed.pathname.split('/')[2];
  if(department==='all'&&parsed.pathname.startsWith('/clinics/')&&inferred!=='all'&&parsed.pathname.split('/')[3]==='all')links.push({label:'Search the named department',title:`Try ${(labels as Record<string,string>)[inferred]} ${place}`,href:searchLink(inferred,location,{...options,query:parsed.searchParams.get('q')||''}),description:'Treat the clinician phrase as a department. Keep other words and filters.'});
  if(query)links.push({label:'Clear keyword',title:`Browse ${department==='all'?'all departments':departmentName} ${place}`,href:searchLink(department,location,{...options,query:''}),description:`Remove only the keyword “${query}”. Keep your other search options.`});
  if(radius&&radius<2000){const wider=radius===500?1000:2000;links.push({label:`Expand radius to ${wider/1000} km`,href:searchLink(department,location,{...options,radius:wider}),description:`Keep ${departmentName.toLowerCase()} and your filters; widen the straight-line search radius.`});}
  if(weekend)links.push({label:'Remove weekend filter',href:searchLink(department,location,{...options,weekend:undefined}),description:'Include clinics without verified weekend hours. Keep other options.'});
  if(registered)links.push({label:'Remove registration filter',href:searchLink(department,location,{...options,registered:false}),description:'Include profiles without a confirmed registry match. Keep other options.'});
  if(specialist)links.push({label:'Remove specialist filter',href:searchLink(department,location,{...options,specialist:false}),description:'Include profiles without a positive reported specialist count. Keep other options.'});
  if(department!=='all')links.push({label:'Search all departments',title:`All departments ${place}`,href:searchLink('all',location,options),description:`Remove only the ${departmentName.toLowerCase()} department selection.`});
  links.push({label:radius?'Choose another station':'Choose another area',href:radius?'#change-station':areaBrowseLink(undefined,{department,query,specialist,registered,weekend}),description:`Keep ${departmentName.toLowerCase()}, the keyword and clinic filters while choosing another location.`});
  return links;
}
