import snapshot from './hira-condition-pilot.json';
import scopes from './condition-scopes.json';
import {conditionRecord} from './hira-conditions';
import {conditionCatalog,conditionAreas,conditionPath} from './condition-search';
export function conditionMatches(condition:string,area:string){
 const category=conditionCatalog.find(c=>c.slug===condition);if(!category)return [];
 return Object.entries(snapshot).flatMap(([key,value])=>{
  const record=conditionRecord(value,key),scope=(scopes as Record<string,{area:string;address:string}>)[key];
  return record&&scope?.area===area&&record.conditions.includes(category.source)?[{...record,address:scope.address}]:[];
 }).sort((a,b)=>a.clinicName.localeCompare(b.clinicName,'ko'));
}
// Editorial pilot threshold, not a search-engine requirement or evidence of full coverage.
export const indexableConditionPages=conditionCatalog.flatMap(c=>conditionAreas.flatMap(a=>conditionMatches(c.slug,a.slug).length>=3?[{condition:c,area:a,path:conditionPath(c.slug,a.slug)}]:[]));
