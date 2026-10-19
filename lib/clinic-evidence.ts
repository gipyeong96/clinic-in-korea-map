export interface ReportedDepartment { code: string; slug: string; name_en: string; name_ko: string; specialist_count: number }
export function reportedDepartments(clinic: any): ReportedDepartment[] {
  return Array.isArray(clinic.departments) ? clinic.departments : [];
}
export function groupedDepartments(clinic: any) {
  const groups: Record<string, {slug:string;name:string;specialists:number}> = {};
  for (const d of reportedDepartments(clinic)) {
    if (!groups[d.slug]) groups[d.slug]={slug:d.slug,name:d.name_en,specialists:0};
    groups[d.slug].specialists+=d.specialist_count || 0;
  }
  return Object.values(groups);
}
export function clinicFocus(clinic: any) {
  if (!clinic.is_premium && !clinic.department_source) return 'Medical Clinic';
  return clinic.categories?.name_en || clinic.category?.name_en || 'Medical Clinic';
}
export function registeredEvidence(clinic: any) {
  const r=clinic.foreign_patient_registration;
  return r?.status==='listed' && /^\d{4}-\d{2}-\d{2}$/.test(r.source_date || '') ? r : null;
}
