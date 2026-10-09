'use client';

import React, { useState, useEffect } from 'react';
import { Locale, getDictionary } from '@/lib/translation';
import ClinicCard from '@/components/ClinicCard';
import MapContainer from '@/components/MapContainer';

interface ClinicSearchClientProps {
  lang?: any;
  filteredClinics: any[];
  mapCenter: { lat: number; lng: number };
}

export default function ClinicSearchClient({
  lang,
  filteredClinics,
  mapCenter: initialMapCenter
}: ClinicSearchClientProps) {
  const dict = getDictionary(lang);
  const [activeClinicId, setActiveClinicId] = useState<string | null>(null);
  const [currentMapCenter, setCurrentMapCenter] = useState(initialMapCenter);
  const [zoom, setZoom] = useState(13);

  // Sync state if initial map center changes due to department/location dynamic updates
  useEffect(() => {
    setCurrentMapCenter(initialMapCenter);
    setActiveClinicId(null);
    setZoom(13);
  }, [initialMapCenter]);

  // Transform clinics to markers format
  const mapMarkers = filteredClinics.map((c) => ({
    id: c.id,
    name: c.name_en,
    lat: c.latitude,
    lng: c.longitude,
    isPremium: c.is_premium
  }));

  const handleMarkerClick = (id: string) => {
    setActiveClinicId(id);
    const clickedClinic = filteredClinics.find((c) => c.id === id);
    if (clickedClinic) {
      setCurrentMapCenter({ lat: clickedClinic.latitude, lng: clickedClinic.longitude });
      setZoom(15);
      
      // Scroll the matching card into view smoothly
      setTimeout(() => {
        const element = document.getElementById(`clinic-card-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  };

  const handleCardFocus = (id: string, lat: number, lng: number) => {
    setActiveClinicId(id);
    setCurrentMapCenter({ lat, lng });
    setZoom(15);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* Clinic Cards List Column */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* SEO Filter Chips (UI Only for now) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-slate-800 text-white shadow-sm">
            {lang === 'mn' ? 'Бүх' : 'All'}
          </button>
          <button className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm">
            {lang === 'mn' ? 'Мэргэжлийн эмч' : 'Specialist'}
          </button>
          <button className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm">
            {lang === 'mn' ? 'Ням гарагт нээлттэй' : 'Sunday'}
          </button>
          <button className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm">
            {lang === 'mn' ? 'Оройн цагаар' : 'Night'}
          </button>
          <button className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm">
            {lang === 'mn' ? 'Шинээр нээгдсэн' : 'New'}
          </button>
        </div>

        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
        {filteredClinics.length > 0 ? (
          filteredClinics.map((clinic) => (
            <div 
              key={clinic.id} 
              id={`clinic-card-${clinic.id}`}
              onClick={() => handleCardFocus(clinic.id, clinic.latitude, clinic.longitude)}
              className={`cursor-pointer rounded-xl transition-all duration-300 ${
                activeClinicId === clinic.id 
                  ? 'ring-2 ring-amber-500 ring-offset-2 scale-[1.01] shadow-md' 
                  : 'hover:scale-[1.005]'
              }`}
            >
              <ClinicCard  clinic={clinic} />
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="text-slate-500 font-semibold">{dict.not_found}</p>
          </div>
        )}
      </div>
      </div>

      {/* Google Maps Container Sticky Column */}
      <div className="lg:col-span-2 lg:sticky lg:top-24 h-[500px] lg:h-[680px]">
        <MapContainer 
          center={currentMapCenter}
          zoom={zoom}
          markers={mapMarkers}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </div>
  );
}
