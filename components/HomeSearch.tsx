'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { homeSearchPath } from '@/lib/search';

interface HomeSearchProps {
  placeholder: string;
  btnText: string;
}

export default function HomeSearch({ placeholder, btnText }: HomeSearchProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(homeSearchPath(query));
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="max-w-xl mx-auto flex items-center bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 text-slate-800"
    >
      <div className="flex items-center gap-2 flex-1 pl-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input 
          aria-label="Search clinics by name, location, or department"
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
