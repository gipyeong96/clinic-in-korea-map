'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {clinicCorrectionLink} from '@/lib/feedback';
export default function FeedbackLinks(){
 const pathname=usePathname();
 const match=pathname.match(/^\/clinics\/detail\/([^/]+)$/);
 let id='';try{id=match?decodeURIComponent(match[1]):'';}catch{}
 return <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1"><Link href={id?clinicCorrectionLink(id):'/feedback?type=correction'} className="inline-flex min-h-11 items-center underline hover:text-white">Report incorrect information</Link><Link href="/feedback?type=suggestion" className="inline-flex min-h-11 items-center underline hover:text-white">Suggest a feature</Link></div>;
}
