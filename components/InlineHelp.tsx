import {Info} from 'lucide-react';

/** Native disclosure keeps help available to touch, keyboard and without hydration. */
export default function InlineHelp({label,children}:{label:string;children:React.ReactNode}){
 return <details className="group rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"><Info aria-hidden="true" className="h-4 w-4 shrink-0"/><span>{label}</span><span aria-hidden="true" className="ml-auto group-open:rotate-180">⌄</span></summary>
  <div className="px-3 pb-3 text-sm leading-relaxed">{children}</div>
 </details>;
}
