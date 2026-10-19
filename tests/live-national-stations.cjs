const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createClient}=require('@supabase/supabase-js');
const config=fs.readFileSync('lib/supabase.ts','utf8');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || config.match(/supabaseUrl = .*?\|\| '([^']+)'/)[1],process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || config.match(/supabaseAnonKey = .*?\|\| '([^']+)'/)[1]);
const pages=require('../lib/stations.json');
async function main(){
 const ids=pages.flatMap(p=>p.stations.map(s=>s.id));
 for(let i=0;i<ids.length;i+=150){
  const r=await db.from('rail_stations').select('id,latitude,longitude').in('id',ids.slice(i,i+150));
  assert.ifError(r.error);assert.equal(r.data.length,new Set(ids.slice(i,i+150)).size);
 }
 console.log('All station IDs verified');
 const results=[];
 for(const ko of ['서면역','반월당역','문화전당역','대전역','강릉역']){
  const s=pages.find(p=>p.name_ko===ko);assert(s);
  const r=await db.rpc('nearby_clinics',{station_ids:s.stations.map(s=>s.id),radius_m:1000});
  assert.ifError(r.error && new Error(`${ko}: ${r.error.message}`)); assert(r.data.length>0,ko);
  assert(r.data.every((c,i)=>c.distance_m<=1000&&(i===0||r.data[i-1].distance_m<=c.distance_m)));
  const latitude=s.stations[0].latitude,longitude=s.stations[0].longitude;
  assert(r.data.every(c=>Math.abs(c.latitude-latitude)<0.03&&Math.abs(c.longitude-longitude)<0.03));
  results.push({station:ko,profiles:r.data.length});
 }
 console.log(JSON.stringify({allStationCoordinatesFound:true,results}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
