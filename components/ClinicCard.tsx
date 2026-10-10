'use strict';
'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, Globe } from 'lucide-react';

interface ClinicCardProps {
  clinic: {
    id: string;
    name_ko: string;
    name_en: string;
    telephone?: string;
    address_ko: string;
    address_en?: string;
    is_premium: boolean;
    premium_data?: any;
    category?: { slug: string; name_en: string };
    location?: { slug: string; name_en: string };
    public_facilities?: any;
    public_equipment?: string[];
  };
}

export default function ClinicCard({ clinic }: ClinicCardProps) {
  const name = clinic.name_en || clinic.name_ko;
  const address = clinic.address_en || clinic.address_ko;
  const slogan = clinic.premium_data?.slogan_en;

  return (
    <div 
      className={`p-5 rounded-xl border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
        clinic.is_premium 
          ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300/30' 
          : 'bg-white border-slate-200'
      }`}
    >
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            clinic.is_premium 
              ? 'bg-amber-500 text-white' 
              : 'bg-slate-100 text-slate-500'
          }`}>
            {clinic.is_premium ? 'Premium Certified' : 'HIRA Public'}
          </span>
        </div>

        <Link href={`/clinics/detail/${clinic.id}`}>
          <h3 className="text-lg font-bold text-slate-800 hover:text-emerald-600 transition mb-1 leading-snug">
            {name}
          </h3>
        </Link>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-3">
          {clinic.category?.name_en} • {clinic.location?.name_en}
        </span>

        {clinic.is_premium && slogan && (
          <p className="text-xs italic text-slate-600 mb-4 line-clamp-2">
            "{slogan}"
          </p>
        )}

        <div className="space-y-2 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{address}</span>
          </div>
          {clinic.telephone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{clinic.telephone}</span>
            </div>
          )}
        </div>
        
        {/* Public Facilities & Equipment Badges */}
        {(clinic.public_equipment?.length > 0 || clinic.public_facilities?.inpatient_beds > 0) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {clinic.public_equipment?.map((eq: string) => (
              <span key={eq} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded border border-slate-200">
                {eq}
              </span>
            ))}
            {clinic.public_facilities?.inpatient_beds > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-500 text-[10px] rounded border border-blue-100">
                Inpatient Beds
              </span>
            )}
            {clinic.public_facilities?.surgery_rooms > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-50 text-rose-500 text-[10px] rounded border border-rose-100">
                Surgery Room
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
        <Link 
          href={`/clinics/detail/${clinic.id}`}
          className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold transition ${
            clinic.is_premium
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          View Details
        </Link>
        {clinic.is_premium && clinic.premium_data?.website && (
          <a
            href={clinic.premium_data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-100 transition"
            title="Website"
          >
            <Globe className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
