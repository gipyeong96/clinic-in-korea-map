import NearbySearch from '@/components/NearbySearch';
import {SITE_URL} from '@/lib/site';
export const metadata={title:'Find clinics near me in Korea | Korea Clinic Map',alternates:{canonical:`${SITE_URL}/nearby`},robots:{index:false,follow:true}};
export default function NearbyPage(){return <div className="max-w-5xl mx-auto px-4 py-8 space-y-5"><h1 className="text-3xl font-black">Find clinics near me</h1><p>Use your current location to find clinics by straight-line distance. Then narrow your search by department.</p><NearbySearch/></div>;}
