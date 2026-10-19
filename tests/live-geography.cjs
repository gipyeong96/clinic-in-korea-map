// Read-only smoke test against the public API. Run after the DB migration.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {createClient}=require('@supabase/supabase-js');
const config=fs.readFileSync('lib/supabase.ts','utf8');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL || config.match(/supabaseUrl = .*?\|\| '([^']+)'/)[1];
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || config.match(/supabaseAnonKey = .*?\|\| '([^']+)'/)[1];
const db=createClient(url,key);
async function main(){
  const {data:stations,error:stationError}=await db.from('rail_stations').select('id');
  assert.ifError(stationError); assert.equal(stations.length,276);
  const {data,error}=await db.rpc('nearby_clinics',{station_ids:['seoulmetro-2-222'],radius_m:500,category_slug:'all'});
  assert.ifError(error); assert(data.length>0);
  assert(data.every((c,i)=>c.distance_m<=500 && (!i || c.distance_m>=data[i-1].distance_m)));
  const seoul=await db.rpc('nearby_clinics',{station_ids:['seoulmetro-1-150','seoulmetro-4-426'],radius_m:2000,category_slug:'all',result_limit:200});
  assert.ifError(seoul.error);
  assert(seoul.data.every(c=>!(c.latitude===37.5665 && c.longitude===126.9780)));
  const {data:clinics,error:regionError}=await db.from('clinics').select('address_ko,locations(*)').or('address_ko.like."서울특별시 강남구 %",address_ko.like."서울 강남구 %",address_ko.like."서울특별시 서초구 %",address_ko.like."서울 서초구 %"').limit(100);
  assert.ifError(regionError); assert(clinics.length>0);
  assert(clinics.every(c=>/^서울(?:특별시)? (강남구|서초구) /.test(c.address_ko)));
  const {data:sinsa,error:sinsaError}=await db.from('clinics').select('address_ko,locations!inner(*)').eq('locations.name_ko','신사동').limit(1000);
  assert.ifError(sinsaError);
  const gangnamIds=new Set(sinsa.filter(c=>c.address_ko.includes('강남구')).map(c=>c.locations.id));
  const eunpyeongIds=new Set(sinsa.filter(c=>c.address_ko.includes('은평구')).map(c=>c.locations.id));
  assert(gangnamIds.size>0 && eunpyeongIds.size>0);
  assert([...gangnamIds].every(id=>!eunpyeongIds.has(id)));
  console.log(JSON.stringify({officialStations:stations.length,gangnamRadiusResults:data.length,areaResults:clinics.length,sinsaDistrictsSeparated:true}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
