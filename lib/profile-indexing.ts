// User approved this single Clinic Map profile on 2026-10-30.
export const excludedProfileId='JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNDgxMTkxIzIxIyQyIyQ1IyQwMCQyNjE0ODEjODEjJDEjJDIjJDgz';
export function excludedFromSearch(clinic:{id?:string;hira_code?:string}){
 return clinic.hira_code===excludedProfileId||clinic.id===excludedProfileId;
}
