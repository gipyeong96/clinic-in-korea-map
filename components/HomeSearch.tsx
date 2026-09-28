'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface HomeSearchProps {
  placeholder: string;
  btnText: string;
}

export default function HomeSearch({ placeholder, btnText }: HomeSearchProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      router.push(`/clinics/all/all`);
      return;
    }

    // Determine category match
    let category = 'all';
    if (trimmed.includes('urology')) category = 'urology';
    else if (trimmed.includes('dent')) category = 'dentistry';
    else if (trimmed.includes('internal')) category = 'internal-medicine';
    else if (trimmed.includes('derm')) category = 'dermatology';
    else if (trimmed.includes('plastic')) category = 'plastic-surgery';

    // Determine location match
    let location = 'all';
    if (trimmed.includes('gangnam')) location = 'gangnam';
    else if (trimmed.includes('seoul')) location = 'seoul-station';
    else if (trimmed.includes('jamsil')) location = 'jamsil';
    else if (trimmed.includes('incheon')) location = 'incheon';
    else if (trimmed.includes('dongtan')) location = 'dongtan';

    if (category === 'all' && location === 'all') {
      router.push(`/clinics/all/all?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/clinics/${category}/${location}`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="max-w-xl mx-auto flex items-center bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 text-slate-800"
    >
      <div className="flex items-center gap-2 flex-1 pl-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input 
          type="text" 
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
  );
}
