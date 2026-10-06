'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ currentLang }: { currentLang?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    
    // Simple path replacement logic for language switcher
    if (pathname) {
      // If pathname starts with current language, replace it
      if (currentLang && pathname.startsWith(`/${currentLang}`)) {
        router.push(pathname.replace(`/${currentLang}`, `/${newLang}`));
      } else {
        // Otherwise prefix it
        router.push(`/${newLang}${pathname}`);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
      <Globe className="w-4 h-4 text-slate-500" />
      <select 
        value={currentLang || 'en'} 
        onChange={handleLanguageChange}
        className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
      >
        <option value="en">EN</option>
        <option value="mn">MN</option>
      </select>
    </div>
  );
}
