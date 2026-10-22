import {clinicName,clinicAddress,clinicPhone,clinicDirections,cleanText} from './clinic-contact';
import {groupedDepartments,registeredEvidence} from './clinic-evidence';
import {clinicPath} from './site';

export function comparisonIds(value:unknown):string[]|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const ids=(value as {ids?:unknown}).ids;
 if(!Array.isArray(ids)||ids.length<2||ids.length>3||ids.some(id=>typeof id!=='string'||! /^[A-Za-z0-9_-]{1,200}$/.test(id))||new Set(ids).size!==ids.length)return null;
 return ids;
}
export function comparisonProfile(clinic:any){
 const departments=clinic.department_source?groupedDepartments(clinic):[];
 const record=registeredEvidence(clinic);
 return {
  name:clinicName(clinic),nameKo:cleanText(clinic.name_ko),path:clinicPath(clinic),address:clinicAddress(clinic),
  phone:clinicPhone(clinic.telephone),directions:clinicDirections(clinic),
  departments:departments.map(d=>({name:cleanText(d.name),specialists:Number.isFinite(d.specialists)&&d.specialists>0?d.specialists:0})),
  departmentSource:clinic.department_source?cleanText(clinic.department_source):null,
  registration:record?{date:record.source_date,checked:cleanText(record.checked_at)}:null,
 };
}
export type ComparisonProfile=ReturnType<typeof comparisonProfile>;
export type ComparisonRow={id:string;status:'ok';profile:ComparisonProfile}|{id:string;status:'missing'|'error'};
