'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {searchReturnPath} from '@/lib/detail-navigation';

// Read navigation-only query state in the browser so public HTML can use ISR.
export default function ClinicReturnLink({region='all'}:{region?:string}){
 const [returnTo,setReturnTo]=useState<string|null>(null);
 useEffect(()=>{setReturnTo(searchReturnPath(new URLSearchParams(window.location.search).get('returnTo')));},[]);
 return <Link prefetch={false} href={returnTo||`/clinics/all/${region}`} className="min-h-11 inline-flex items-center rounded-lg border bg-white px-4 py-2 text-sm font-semibold">{returnTo?'← Back to search results':'Browse clinics in this area'}</Link>;
}
