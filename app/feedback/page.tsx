import Link from 'next/link';
import FeedbackForm from '@/components/FeedbackForm';
import {SITE_URL,clinicPath} from '@/lib/site';
import {getClinicById} from '@/lib/supabase';
import {additionalGoldmanClinic} from '@/lib/goldman';
import {clinicName} from '@/lib/clinic-contact';
export const metadata={title:'Report information or suggest a feature | Korea Clinic Map',alternates:{canonical:`${SITE_URL}/feedback`}};
export default async function FeedbackPage({searchParams={}}:{searchParams?:{type?:string|string[];clinic?:string|string[]}}){
 const id=typeof searchParams.clinic==='string'&&searchParams.clinic.length<=400&&!/[\u0000-\u001f\u007f]/.test(searchParams.clinic)?searchParams.clinic:'';
 let clinic=null;
 if(id){try{clinic=additionalGoldmanClinic(id)||await getClinicById(id);}catch{}}
 const name=clinic?clinicName(clinic):'',url=clinic?`${SITE_URL}${clinicPath(clinic)}`:'';

 return <div className="max-w-2xl mx-auto px-4 py-8 space-y-5"><Link href="/" className="min-h-11 inline-flex items-center underline">← Back to clinic search</Link><h1 className="text-3xl font-bold">Help improve Korea Clinic Map</h1><p className="text-slate-600">Found an incorrect address, phone number or other detail? Have an idea to make finding a clinic easier? Let us know.</p>{id&&!clinic&&<p role="status" className="text-sm text-slate-600">Clinic details could not be loaded. Please enter the clinic name and page link below.</p>}<FeedbackForm key={`${searchParams.type}-${id}`} initialName={name} initialUrl={url} initialType={typeof searchParams.type==='string'?searchParams.type:'suggestion'}/></div>;
}
