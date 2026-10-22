import FeedbackLinks from '@/components/FeedbackLinks';
import Link from 'next/link';
import React from 'react';
export default function Template({children}:{children:React.ReactNode}){
 return <>{children}<nav aria-label="Clinic in Korea main website" className="bg-slate-900 border-t border-slate-800 px-4 py-4 text-center text-sm text-slate-300"><a href="https://clinicinkorea.com/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline hover:text-white">Visit Clinic in Korea · Main website <span className="sr-only">(opens in a new tab)</span></a><FeedbackLinks/><div className="flex justify-center gap-6"><Link href="/privacy" className="inline-flex min-h-11 items-center underline">Privacy</Link><Link href="/terms" className="inline-flex min-h-11 items-center underline">Terms</Link></div></nav></>;
}
