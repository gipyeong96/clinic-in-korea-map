export const focusCategories=['medical-clinic','general-hospital','long-term-care'];
export function isFocusCategory(slug:string){return focusCategories.includes(slug);}
export function matchesClassification(clinic:any,slug='all'){
 return slug==='all'||(isFocusCategory(slug)?(clinic.categories?.slug||clinic.category?.slug)===slug:clinic.departments?.some((d:any)=>d.slug===slug));
}
export function matchesSpecialist(clinic:any,slug='all'){
 return slug==='all'||isFocusCategory(slug)?!!clinic.has_specialist&&!!clinic.department_source:!!clinic.specialist_slugs?.includes(slug);
}
export function applyClassification(query:any,slug='all',specialist=false){
 if(slug!=='all')query=isFocusCategory(slug)?query.eq('categories.slug',slug):query.contains('departments',JSON.stringify([{slug}]));
 if(specialist)query=slug==='all'||isFocusCategory(slug)?query.eq('has_specialist',true).not('department_source','is',null):query.contains('specialist_slugs',[slug]);
 return query;
}
