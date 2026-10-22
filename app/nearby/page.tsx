import NearbySearch from '@/components/NearbySearch';
import {SITE_URL} from '@/lib/site';
import {nearbyOptions} from '@/lib/nearby';
import {hasNearMeIntent,homeSearchPath} from '@/lib/search';
export const metadata={title:'Find clinics near me in Korea | Korea Clinic Map',alternates:{canonical:`${SITE_URL}/nearby`},robots:{index:false,follow:true}};
export default function NearbyPage({searchParams}:{searchParams:Record<string,string|string[]|undefined>}){
 const initial=nearbyOptions(searchParams);
 if(hasNearMeIntent(initial.query)){
  const parsed=new URL(homeSearchPath(initial.query),SITE_URL);
  initial.query=parsed.searchParams.get('q')||'';
  if(initial.department==='all')initial.department=parsed.searchParams.get('department')||'all';
 }
 return <div className="max-w-5xl mx-auto px-4 py-8 space-y-5"><h1 className="text-3xl font-black">Find clinics near me</h1><p>Use your current location to find clinics by straight-line distance. Review your search options, then choose “Use my location” to start.</p><NearbySearch key={JSON.stringify(initial)} initial={initial}/></div>;
}
