'use strict';
'use client';
import {goldmanBranch,goldmanLocationUrl,GOLDMAN_ENGLISH_URL} from '@/lib/goldman';


import React from 'react';
import {cardAddress} from '@/lib/card-location';
import Link from 'next/link';
import { Phone, MapPin, Globe } from 'lucide-react';
import { clinicFocus, groupedDepartments } from '@/lib/clinic-evidence';
import RegistrationBadge from './RegistrationBadge';
import ClinicContact from './ClinicContact';
import {clinicName,clinicPhone,hasClinicCoordinates} from '@/lib/clinic-contact';
import {clinicPath} from '@/lib/site';
import {clinicDetailLink} from '@/lib/detail-navigation';
import {SaveClinic} from '@/components/ClinicLibrary';
import {clinicSnapshot} from '@/lib/clinic-library';

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

export default function ClinicCard({ clinic, selectedDepartment='all', onShowMap, returnTo }: any) {
  const name = clinicName(clinic);
  const address = cardAddress(clinic);
  const branch=goldmanBranch(String(clinic.id));
  const nearby=clinic.card_station;
  const phone=clinicPhone(clinic.telephone);
  const slogan = clinic.premium_data?.slogan_en;
  
  const categoryName = clinicFocus(clinic);
  const departments = groupedDepartments(clinic);
  const selected = departments.find(d=>d.slug===selectedDepartment);
  const locationName = clinic.address_region?.label || '';
  const detailHref = clinicDetailLink(clinicPath(clinic),returnTo,clinic.id);

  return (
    <div 
      className={`min-w-0 break-words p-5 rounded-xl border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
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

        <Link href={detailHref}>
          <h3 className="text-lg font-bold text-slate-800 hover:text-emerald-600 transition mb-0.5 leading-snug">
            {name}
          </h3>
        </Link>
        {clinic.name_ko && clinic.name_ko !== name && (
          <p className="text-xs text-slate-500 font-medium mb-1">
            {clinic.name_ko}
          </p>
        )}
        <RegistrationBadge clinic={clinic} />
        {typeof clinic.distance_m === 'number' && <p className="text-sm font-semibold text-slate-700 mb-2">{clinic.station_name} · {Math.round(clinic.distance_m)} m <span className="text-xs font-normal">straight-line distance</span></p>}
        {branch?<p className="text-sm text-slate-700 mb-2"><a href={goldmanLocationUrl(branch.tab)} target="_blank" rel="noopener noreferrer" className="underline">Station access: {branch.transit}</a><span className="block text-xs text-slate-500">Clinic’s published directions</span></p>:!(typeof clinic.distance_m==='number')&&nearby&&<p className="text-sm text-slate-700 mb-2"><Link href={`/clinics/${selectedDepartment}/${nearby.slug}`} className="underline">Nearby station: {nearby.name}</Link> · {Math.round(nearby.distance)} m<span className="block text-xs text-slate-500">Straight-line distance · official station coordinates</span></p>}
        {(categoryName || locationName) && (
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-3">
            {categoryName} {categoryName && locationName ? '•' : ''} {locationName}
          </span>
        )}
        {selected && <p className="text-xs text-slate-600 mb-2">{selected.name} reported · {selected.specialists>0 ? `${selected.specialists} specialist${selected.specialists===1?'':'s'} reported` : 'No specialist recorded in this department'}</p>}
        {departments.length>0 && <p className="text-xs text-slate-500 mb-3">Reported departments: {departments.slice(0,3).map(d=>d.name).join(', ')}{departments.length>3 ? ` +${departments.length-3} more` : ''}</p>}

        {clinic.is_premium && slogan && slogan!==branch?.transit && (
          <p className="text-xs italic text-slate-600 mb-4 line-clamp-2">
            "{slogan}"
          </p>
        )}

        <div className="space-y-2 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span className="break-words">{address.primary || 'Address not provided'}</span>
          </div>
          {address.korean&&address.korean!==address.primary&&<details><summary className="cursor-pointer min-h-11 py-3 underline">Korean address for taxi / copy</summary><p className="select-all break-words pb-2">{address.korean}</p></details>}
          {phone.display && (
            <div aria-label="Clinic telephone" className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{phone.display}</span>
            </div>
          )}
        </div>
        
        {/* Public Facilities & Equipment Badges */}
        {((clinic.public_equipment?.length ?? 0) > 0 || (clinic.public_facilities?.inpatient_beds ?? 0) > 0) && (
          <div role="group" aria-label="Equipment and facilities" className="mt-4 border-t border-slate-100 pt-3 flex flex-wrap gap-1.5">
            {clinic.public_equipment?.map((eq: string) => (
              <span key={eq} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded border border-slate-200">
                {eq}
              </span>
            ))}
            {(clinic.public_facilities?.inpatient_beds ?? 0) > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-500 text-[10px] rounded border border-blue-100">
                Inpatient Beds
              </span>
            )}
            {(clinic.public_facilities?.surgery_rooms ?? 0) > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-50 text-rose-500 text-[10px] rounded border border-rose-100">
                Surgery Room
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
        <SaveClinic clinic={clinicSnapshot(clinic)} />
        <ClinicContact clinic={clinic} compact />
        <div className="flex gap-2">
        <Link 
          href={detailHref}
          className={`min-h-11 flex-1 inline-flex items-center justify-center text-center py-2 rounded-lg text-sm font-semibold transition ${
            clinic.is_premium
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          View Details
        </Link>
        {onShowMap&&hasClinicCoordinates(clinic)&&<button type="button" onClick={onShowMap} className="min-h-11 border rounded-lg px-3 py-2 text-sm font-semibold">Show on map</button>}
        {clinic.is_premium && clinic.premium_data?.website && (
          <a
            href={goldmanBranch(String(clinic.id))?GOLDMAN_ENGLISH_URL:clinic.premium_data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 inline-flex items-center justify-center gap-1 px-2 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 transition text-xs font-semibold"
            title={goldmanBranch(String(clinic.id))?'Official English website':'Website'}
            aria-label={goldmanBranch(String(clinic.id))?`Official English website for ${name}`:`Website for ${name}`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            {goldmanBranch(String(clinic.id))&&<span>English site</span>}
          </a>
        )}
        </div>
      </div>
    </div>
  );
}
