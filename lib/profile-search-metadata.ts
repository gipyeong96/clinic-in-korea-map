import {clinicName} from './clinic-contact';
import {clinicFocus} from './clinic-evidence';
import {clinicRegion} from './clinic-region';
// Exact HIRA identities observed for doctor near me, 21–27 Oct 2026.
const pilot=new Set([
 'JDU4MTI3MSM1MSMkMiMkMCMkMDAkNDgxOTYxIzMxIyQxIyQ3IyQ2MiQ0NjE0ODEjODEjJDEjJDYjJDgz',
 'JDQ4MTg4MSM1MSMkMiMkOCMkMDAkMzgxMzUxIzMxIyQxIyQzIyQwMyQ0NjE0ODEjNTEjJDEjJDYjJDgz',
 'JDQ4MTg4MSM1MSMkMiMkNCMkMDAkMzgxNzAyIzExIyQxIyQzIyQ4MiQzNjEyMjIjNTEjJDEjJDYjJDgz',
]);
export function profileSearchMetadata(clinic:any){
 if(!pilot.has(clinic.hira_code)||!clinic.department_source)return undefined;
 const region=clinicRegion(clinic)?.label;if(!region)return undefined;
 const name=clinicName(clinic),focus=clinicFocus(clinic);
 return {title:`${name} — ${focus} in ${region} | Korea Clinic Map`,description:`Find ${name} in ${region}. View its reported clinic focus (${focus}), Korean address, telephone and nearby station. Confirm services, hours and language support directly.`};
}
