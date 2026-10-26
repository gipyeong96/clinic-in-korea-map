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
 return <div className="max-w-5xl mx-auto px-4 py-5 space-y-3 sm:py-8"><NearbySearch key={JSON.stringify(initial)} initial={initial}/></div>;
}
