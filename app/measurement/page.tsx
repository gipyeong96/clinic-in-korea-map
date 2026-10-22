import MeasurementPreference from '@/components/MeasurementPreference';
export const metadata={title:'Analytics preference | Korea Clinic Map',robots:{index:false,follow:false}};
export default function MeasurementPage(){return <article className="max-w-3xl mx-auto p-5 space-y-5"><h1 className="text-2xl font-bold">Analytics preference</h1><p>Use this setting to exclude this browser from application analytics during internal site checks.</p><MeasurementPreference/></article>;}
