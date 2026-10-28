'use client';
import {useEffect,useState} from 'react';
export default function MobileCardDetails({label,children,hashTarget}:{label:string;children:React.ReactNode;hashTarget?:string}){
 const [wide,setWide]=useState(false),[expanded,setExpanded]=useState(false);
 useEffect(()=>{const media=window.matchMedia('(min-width: 640px)');const sync=()=>setWide(media.matches);sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync);},[]);
 useEffect(()=>{if(!hashTarget)return;const reveal=()=>{if(window.location.hash===`#${hashTarget}`)setExpanded(true);};reveal();window.addEventListener('hashchange',reveal);return()=>window.removeEventListener('hashchange',reveal);},[hashTarget]);
 return <details open={wide||expanded} className="mt-2 sm:mt-0"><summary className="min-h-11 cursor-pointer py-3 text-xs font-semibold underline sm:hidden" onClick={event=>{if(!wide){event.preventDefault();setExpanded(value=>!value);}}}>{label}</summary><div className="space-y-2">{children}</div></details>;
}
