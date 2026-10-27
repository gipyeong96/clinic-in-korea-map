export function confirmedEmptyResult(result:{clinics:unknown[];failed:boolean}|null){return !!result&&!result.failed&&result.clinics.length===0;}
