export const SITE_URL = 'https://map.clinicinkorea.com';

// Exact records checked against branch name, address and telephone on 2026-10-22.
// Keep legacy IDs routable; never infer identity from a similar clinic name.
export const unifiedClinicRecords=[
 {id:'goldman-gangnam',aliases:['a48f738d-b360-4121-8b85-d49c15889baf','85ed27c9-0b6e-45c6-81ee-5d81fe36a2fc','e5d6e98f-98b5-498f-b6ec-cc50f560ebe5'],hira:'JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzExIyQxIyQzIyQ5OSQzNjE4MzIjNjEjJDEjJDQjJDgz'},
 {id:'goldman-seoulyeok',aliases:['013294ef-1ab5-45e9-a4f1-068c38cc5553','9cd4a930-5820-4ac0-8081-444ac1cca448','fc5c4dae-aeed-4492-9f46-0295d5df3ad8'],hira:'JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzIxIyQxIyQ5IyQwMyQ0NjEwMDIjNDEjJDEjJDgjJDgz'},
 {id:'goldman-incheon',aliases:['1abfbc12-0679-4897-8b0d-398a8633c145','13ebcee5-2afd-4917-a484-60a5a38d9f0e','d28d025c-eee5-4c0d-ae89-4ea824eaa623'],hira:'JDU4MTI3MSM1MSMkMiMkMCMkMDAkNDgxNzAyIzExIyQyIyQzIyQwMCQzNjE4MzIjNjEjJDEjJDgjJDgz'},
 {id:'goldman-dongtan',aliases:['58364127-19b7-4f35-bacf-4f62a0d4ef7e','6f05a9f6-9d3a-4a8e-98a1-ce1a211f4c55','bd44562e-af8c-407a-8c0b-22b95c8e81ee'],hira:'JDU4MTI3MSM1MSMkMiMkMCMkMDAkNTgxMzUxIzExIyQxIyQ3IyQ4OSQzNjEwMDIjNzEjJDEjJDgjJDgz'},
 {id:'goldman-jamsil',aliases:['c1072301-45cc-4fe4-9d88-0538511d3df8','0018c959-9e0a-4858-b27c-9f19a803a15a','3327f0c8-252b-4c3f-99ef-ab6fee61ec79'],hira:'JDQ4MTg4MSM1MSMkMiMkOCMkMDAkMzgxMzUxIzMxIyQyIyQ3IyQwMCQyNjEyMjIjNjEjJDEjJDAjJDgz'},
];
export function unifiedClinicRecord(id:string){return unifiedClinicRecords.find(c=>c.id===id||c.hira===id||c.aliases.includes(id.toLowerCase()));}
export function canonicalClinicId(id:string){return unifiedClinicRecord(id)?.id||id;}

export function clinicPath(clinic: { hira_code?: string | null; id: string }) {
  const record=unifiedClinicRecord(clinic.id)||unifiedClinicRecord(clinic.hira_code||'');
  return `/clinics/detail/${encodeURIComponent(record?.id||clinic.hira_code || clinic.id)}`;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
