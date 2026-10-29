import type {ReactNode} from 'react';

export default function InfoDisclosure({label,children}:{label:string;children:ReactNode}){
 return <details className="text-xs text-slate-600">
  <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-lg px-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 [&::-webkit-details-marker]:hidden" aria-label={label}>
   <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-400 text-sm font-semibold">i</span>
   <span>{label}</span>
  </summary>
  <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed">{children}</div>
 </details>;
}
