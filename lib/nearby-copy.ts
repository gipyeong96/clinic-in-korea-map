import labels from './department-labels.json';
export function nearbyAction(department:string){
 return department==='dentistry'?'Find dentists near me':department==='all'?'Find clinics near me':`Find ${((labels as Record<string,string>)[department]||'medical').toLowerCase()} clinics near me`;
}
