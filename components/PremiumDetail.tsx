'use strict';
'use client';

import React from 'react';
import { Locale, getDictionary } from '@/lib/translation';
import MapContainer from './MapContainer';
import { Phone, MapPin, Clock, Languages, Award, Users, BookOpen } from 'lucide-react';

interface PremiumDetailProps {
  lang?: any;
  clinic: any;
}

export default function PremiumDetail({ lang, clinic }: PremiumDetailProps) {
  const dict = getDictionary(lang);
  const name = clinic.name_en;
  const address = clinic.address_en || clinic.address_ko;
  
  const premiumData = clinic.premium_data || {};
  const slogan = premiumData[`slogan_${lang}`] || premiumData.slogan_en;
  const specialties = premiumData.specialties || [];
  const doctors = premiumData.doctors || [];
  const supportedLangs = premiumData.languages || [];

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Premium Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-12 px-4 shadow-sm">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            🌟 {dict.premium_badge}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            {name}
          </h1>
          {slogan && (
            <p className="text-lg text-amber-50/90 font-medium italic max-w-2xl leading-relaxed">
              "{slogan}"
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Key Specialties */}
          {specialties.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <Award className="w-5 h-5 text-amber-500" />
                {dict.specialties}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specialties.map((spec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-amber-500 font-bold">✓</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical Staff */}
          {doctors.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <Users className="w-5 h-5 text-amber-500" />
                {dict.doctors}
              </h2>
              <div className="space-y-4">
                {doctors.map((doc: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                      MD
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{doc.name_en}</h4>
                      <p className="text-xs text-slate-500">{doc.role_en}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Interactive Map Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              {'Location Map'}
            </h2>
            <div className="h-[300px]">
              <MapContainer
                center={{ lat: clinic.latitude, lng: clinic.longitude }}
                zoom={14}
                markers={[{
                  id: clinic.id,
                  name: name,
                  lat: clinic.latitude,
                  lng: clinic.longitude,
                  isPremium: true
                }]}
              />
            </div>
          </div>

          {/* Programmatic FAQ Page for AEO/GEO */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              {dict.faq_section}
            </h2>
            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-amber-500 pl-4 py-1 bg-slate-50/50 rounded-r">
                <span className="font-bold text-amber-700 block mb-1">
                  Q. Does {name} offer services for international patients?
                </span>
                <p className="text-slate-600">
                  Yes, {name} provides dedicated urological care with translation support. The clinic is equipped to handle consultation in {supportedLangs.join(', ')}.
                </p>
              </div>
              <div className="border-l-4 border-amber-500 pl-4 py-1 bg-slate-50/50 rounded-r">
                <span className="font-bold text-amber-700 block mb-1">
                  Q. What is the address of {name}?
                </span>
                <p className="text-slate-600">
                  The clinic is located at {address}. You can find the location pinned on our integrated Google Map page.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-5">
            <h3 className="font-bold text-slate-800 text-md border-b pb-2">
              {'Quick Details'}
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-700 mb-0.5">{dict.address}</span>
                  <span>{address}</span>
                </div>
              </div>

              {clinic.telephone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-700 mb-0.5">{dict.phone}</span>
                    <a href={`tel:${clinic.telephone}`} className="text-amber-600 font-semibold hover:underline">
                      {clinic.telephone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-700 mb-0.5">{dict.hours}</span>
                  {Object.entries(clinic.opening_hours || {}).map(([key, val]: any) => (
                    <div key={key} className="flex gap-2">
                      <span className="capitalize text-slate-500 w-16">{key}:</span>
                      <span className="font-medium text-slate-700">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {supportedLangs.length > 0 && (
                <div className="flex items-start gap-2">
                  <Languages className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-700 mb-0.5">{dict.languages}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {supportedLangs.map((langStr: string) => (
                        <span key={langStr} className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-semibold">
                          {langStr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Booking CTA */}
            {premiumData.booking_link && (
              <a
                href={premiumData.booking_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition text-sm"
              >
                💬 {dict.book_now}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
