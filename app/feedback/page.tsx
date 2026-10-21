import Link from 'next/link';
import FeedbackForm from '@/components/FeedbackForm';
import {SITE_URL} from '@/lib/site';
export const metadata={title:'Report information or suggest a feature | Korea Clinic Map',alternates:{canonical:`${SITE_URL}/feedback`}};
export default function FeedbackPage({searchParams={}}:{searchParams?:{type?:string|string[]}}){
 return <div className="max-w-2xl mx-auto px-4 py-8 space-y-5"><Link href="/" className="min-h-11 inline-flex items-center underline">← Back to clinic search</Link><h1 className="text-3xl font-bold">Help improve Korea Clinic Map</h1><p className="text-slate-600">Found an incorrect address, phone number or other detail? Have an idea to make finding a clinic easier? Let us know.</p><FeedbackForm key={typeof searchParams.type==='string'?searchParams.type:'suggestion'} initialType={typeof searchParams.type==='string'?searchParams.type:'suggestion'}/></div>;
}
