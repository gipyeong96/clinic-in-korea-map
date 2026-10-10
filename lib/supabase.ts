import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getClinics(params?: { categorySlug?: string, locationSlug?: string, limit?: number }) {
  let query = supabase.from('clinics').select('*, categories!inner(*), locations!inner(*)');
  
  if (params?.categorySlug && params.categorySlug !== 'all') {
    query = query.eq('categories.slug', params.categorySlug);
  }
  if (params?.locationSlug && params.locationSlug !== 'all') {
    query = query.eq('locations.slug', params.locationSlug);
  }
  
  // Always bring premium first, then some non-premium for the area
  query = query.order('is_premium', { ascending: false }).limit(params?.limit || 100);
  
  const { data, error } = await query;
  if (error) {
    console.error('Supabase getClinics error:', error);
    return [];
  }
  return data || [];
}

export async function getClinicById(id: string) {
  const { data, error } = await supabase
    .from('clinics')
    .select('*, categories(*), locations(*)')
    .eq('hira_code', id)
    .single();
    
  if (error) {
    console.error('Supabase getClinicById error:', error);
    return null;
  }
  return data;
}
