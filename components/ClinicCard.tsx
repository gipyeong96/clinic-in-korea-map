'use strict';
'use client';
import {goldmanBranch,goldmanLocationUrl,GOLDMAN_ENGLISH_URL} from '@/lib/goldman';


import React from 'react';
import {cardAddress} from '@/lib/card-location';
import Link from 'next/link';
import { Phone, MapPin, Globe, TrainFront, CalendarDays, Stethoscope, ChevronDown } from 'lucide-react';
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

export default function ClinicCard({ clinic, selectedDepartment='all', onShowMap, returnTo, distanceOrigin }: any) {
  const name = clinicName(clinic);
  const address = cardAddress(clinic);
  const branch=goldmanBranch(String(clinic.id));
  const nearby=clinic.card_station;
  const phone=clinicPhone(branch?.phone||clinic.telephone);
  const slogan = clinic.premium_data?.slogan_en;
  
  const categoryName = clinicFocus(clinic);
  const departments = groupedDepartments(clinic);
  const selected = departments.find(d=>d.slug===selectedDepartment);
  const locationName = clinic.address_region?.label || '';
  const detailHref = clinicDetailLink(clinicPath(clinic),returnTo,clinic.id);

  return (
    <div 
      className={`min-w-0 break-words p-5 rounded-2xl border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
        clinic.is_premium 
          ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300/30' 
          : 'bg-white border-slate-200'
      }`}
    >
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            clinic.is_premium 
              ? 'bg-amber-100 text-amber-900'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {clinic.is_premium ? 'Partner clinic' : 'HIRA Public'}
          </span>
          {clinic.is_premium&&<span className="text-xs text-slate-600">Commercial relationship · not a clinical certification</span>}
        </div>

        <Link href={detailHref} prefetch={false}>
          <h3 className="text-xl font-bold text-slate-900 hover:text-emerald-600 transition mb-0.5 leading-snug">
            {name}
          </h3>
        </Link>
        {clinic.name_ko && clinic.name_ko !== name && (
          <p className="text-xs text-slate-500 font-medium mb-1">
            {clinic.name_ko}
          </p>
        )}
        <RegistrationBadge clinic={clinic} />
        {clinic.weekend_label&&<p className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2 text-sm font-semibold text-amber-900 my-2"><CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5"/>{clinic.weekend_label}</p>}
        {typeof clinic.distance_m === 'number' && <p className="flex flex-wrap items-center gap-1.5 rounded-lg bg-blue-50 p-2 text-sm font-semibold text-blue-900 mb-2"><TrainFront aria-hidden="true" className="h-4 w-4 shrink-0"/>{distanceOrigin?`From ${distanceOrigin}`:clinic.station_name||'Search origin'} · {Math.round(clinic.distance_m)} m <span className="text-xs font-normal">straight-line distance</span></p>}
        {branch?<p className="text-sm text-slate-700 mb-2"><a href={goldmanLocationUrl(branch.tab)} target="_blank" rel="noopener noreferrer" className="underline">Station access: {branch.transit}</a><span className="block text-xs text-slate-500">Clinic’s published directions</span></p>:!(typeof clinic.distance_m==='number')&&nearby&&<p className="text-sm text-slate-700 mb-2"><Link href={`/clinics/${selectedDepartment}/${nearby.slug}`} className="underline">Nearby station: {nearby.name}</Link> · {Math.round(nearby.distance)} m<span className="block text-xs text-slate-500">Straight-line distance · official station coordinates</span></p>}
        {(categoryName || locationName) && (
          <span className="text-xs text-slate-600 font-medium block mb-3">
            {categoryName} {categoryName && locationName ? '•' : ''} {locationName}
          </span>
        )}
        {selected && <p className="flex items-start gap-2 text-sm text-slate-700 mb-2"><Stethoscope aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5"/>{selected.name} reported · {selected.specialists>0 ? `${selected.specialists} specialist${selected.specialists===1?'':'s'} reported` : 'No specialist recorded in this department'}</p>}


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
        
        {(departments.length>0 || (clinic.public_equipment?.length ?? 0)>0 || (clinic.public_facilities?.inpatient_beds ?? 0)>0 || (clinic.public_facilities?.surgery_rooms ?? 0)>0) && <details className="group mt-4 rounded-xl border border-slate-200 bg-slate-50">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"><span>Departments & facilities</span><ChevronDown aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 group-open:rotate-180"/></summary>
          <div className="px-3 pb-3 space-y-3 text-xs text-slate-600">
            {departments.length>0&&<p><span className="font-semibold">Reported departments: </span>{departments.map(d=>d.name).join(', ')}</p>}
            {((clinic.public_equipment?.length ?? 0)>0 || (clinic.public_facilities?.inpatient_beds ?? 0)>0 || (clinic.public_facilities?.surgery_rooms ?? 0)>0)&&<div role="group" aria-label="Equipment and facilities" className="flex flex-wrap gap-1.5">
              {clinic.public_equipment?.map((eq:string)=><span key={eq} className="rounded border bg-white px-2 py-1">{eq}</span>)}
              {(clinic.public_facilities?.inpatient_beds ?? 0)>0&&<span className="rounded border bg-white px-2 py-1">Inpatient Beds</span>}
              {(clinic.public_facilities?.surgery_rooms ?? 0)>0&&<span className="rounded border bg-white px-2 py-1">Surgery Room</span>}
            </div>}
            <p>Public directory records; confirm current services with the clinic.</p>
          </div>
        </details>}

      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
        <SaveClinic clinic={clinicSnapshot(clinic)} />
        <ClinicContact clinic={branch?{...clinic,telephone:branch.phone}:clinic} compact />
        <div className="flex gap-2">
        <Link 
          href={detailHref}
          prefetch={false}
          className={`min-h-11 flex-1 inline-flex items-center justify-center text-center py-2 rounded-lg text-sm font-semibold transition ${
            clinic.is_premium
              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          View Details
        </Link>
        {onShowMap&&hasClinicCoordinates(clinic)&&<button type="button" onClick={onShowMap} className="min-h-11 border rounded-lg px-3 py-2 text-sm font-semibold">Show on map</button>}
        {(branch || (clinic.is_premium && clinic.premium_data?.website)) && (
          <a
            href={branch?GOLDMAN_ENGLISH_URL:clinic.premium_data.website}
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
