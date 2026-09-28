'use strict';
'use client';

import React from 'react';
import Link from 'next/link';
import { Locale, getDictionary } from '@/lib/translation';
import MapContainer from './MapContainer';
import { Phone, MapPin, Clock } from 'lucide-react';

interface StandardDetailProps {
  lang?: any;
  clinic: any;
}

export default function StandardDetail({ lang, clinic }: StandardDetailProps) {
  const dict = getDictionary(lang);
  const name = clinic.name_en;
  const address = clinic.address_en || clinic.address_ko;
  const categoryName = clinic.category?.[`name_${lang}` as any] || clinic.category?.name_en;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Simple Header */}
      <div className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            📋 {dict.standard_badge}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            {name}
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            {categoryName} • {clinic.location?.[`name_${lang}` as any] || clinic.location?.name_en}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Details Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Info Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
              {'Clinic Information'}
            </h2>
            
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700">{dict.address}</strong>
                  <span>{address}</span>
                </div>
              </div>

              {clinic.telephone && (
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-700">{dict.phone}</strong>
                    <a href={`tel:${clinic.telephone}`} className="text-slate-800 hover:text-emerald-600 transition">
                      {clinic.telephone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700">{dict.hours}</strong>
                  {Object.entries(clinic.opening_hours || {}).map(([key, val]: any) => (
                    <div key={key} className="flex gap-2 text-xs mt-1">
                      <span className="capitalize text-slate-500 w-16">{key}:</span>
                      <span className="font-semibold text-slate-700">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map Location */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
              {'Location'}
            </h3>
            <div className="h-[280px]">
              <MapContainer
                center={{ lat: clinic.latitude, lng: clinic.longitude }}
                zoom={14}
                markers={[{
                  id: clinic.id,
                  name: name,
                  lat: clinic.latitude,
                  lng: clinic.longitude,
                  isPremium: false
                }]}
              />
            </div>
          </div>

        </div>

        {/* Funnel/Recommended Clinic Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-300 p-6 rounded-xl shadow-md space-y-4">
            <div className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3.5 rounded-full inline-block">
              🌟 {'RECOMMENDED PARTNER'}
            </div>
            
            <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
              {lang === 'mn' 
                ? 'Бөөр, шээсний замын тусламж хэрэгтэй байна уу?' 
                : 'Need Specialized Urological Care?'}
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'mn'
                ? 'Шээс бэлгийн замын эмчилгээ, дабинчи SP робот хагалгаа зэрэг нарийн мэргэжлийн тусламж авахыг хүсвэл манай түнш "Голдман" эмнэлэгт хандана уу.'
                : 'For world-class urological procedures, including Da Vinci SP robot surgery and advanced prostate treatment, visit our certified partner, Goldman Urology Clinic.'}
            </p>

            <Link 
              href={`/clinics/detail/goldman-gangnam`}
              className="block text-center bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow transition"
            >
              {'Explore Goldman Urology'}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
