'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { homeSearchPath,searchLink } from '@/lib/search';
import {homeSuggestions} from '@/lib/home-suggestions';
import Link from 'next/link';

interface HomeSearchProps {
  placeholder: string;
  btnText: string;
}

export default function HomeSearch({ placeholder, btnText }: HomeSearchProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const [dismissed,setDismissed]=useState(false);
  const suggestions=useMemo(()=>homeSuggestions(query),[query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(homeSearchPath(query));
  };

  return (
    <div className="max-w-xl mx-auto text-left">
    <form 
      onSubmit={handleSearch}
      className="flex items-center bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 text-slate-800"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0 pl-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input 
          aria-label="Search clinics by name, location, or department"
          type="text" 
          placeholder={placeholder}
          value={query}
          maxLength={200}
          aria-controls="home-search-suggestions"
          onKeyDown={e=>{if(e.key==='Escape')setDismissed(true);}}
          onChange={(e) => {setQuery(e.target.value);setDismissed(false);}}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>
      <button 
        type="submit" 
        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow transition"
      >
        {btnText}
      </button>
    </form>
    {query.trim().length>=2&&!dismissed&&<section id="home-search-suggestions" aria-label="Search suggestions" className="mt-2 rounded-xl border bg-white p-3 text-slate-800 shadow-lg space-y-2">
      <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">Choose what you mean</p><button type="button" onClick={()=>setDismissed(true)} className="min-h-11 px-3 text-xs underline">Dismiss</button></div>
      {suggestions.stations.length>0&&<nav aria-label="Suggested stations"><p className="text-xs font-bold text-slate-500">NEAR A STATION</p>{suggestions.stations.map(s=><Link key={s.href} href={s.href} className="block min-h-11 rounded-lg p-2 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-amber-500"><span className="block text-sm font-semibold">{s.label}</span><span className="block text-xs text-slate-500">{s.detail}</span></Link>)}</nav>}
      {suggestions.regions.length>0&&<nav aria-label="Suggested areas"><p className="text-xs font-bold text-slate-500">IN AN AREA</p>{suggestions.regions.map(s=><Link key={s.href} href={s.href} className="block min-h-11 rounded-lg p-2 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-amber-500"><span className="block text-sm font-semibold">{s.label}</span></Link>)}</nav>}
      <Link href={searchLink('all','all',{query:query.trim()})} className="block min-h-11 border-t pt-3 text-sm underline break-words">Search clinic names / addresses for “{query.trim()}”</Link>
    </section>}
    </div>
  );
}
