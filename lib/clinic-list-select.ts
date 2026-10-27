// Fields consumed by result cards, maps, saved-clinic snapshots and weekend filters.
// Keep inner joins to preserve the existing result membership.
export const CLINIC_LIST_SELECT = [
 'id','hira_code','name_ko','name_en','telephone','address_ko','address_en',
 'latitude','longitude','is_premium','premium_data','location_id',
 'departments','department_source','specialist_slugs','has_specialist',
 'foreign_patient_registration','public_equipment','public_facilities',
 'categories!inner(name_en,slug)','locations!inner(id)',
].join(',');
