'use client';

import React, { useState, useEffect } from 'react';
import { Locale, getDictionary } from '@/lib/translation';
import ClinicCard from '@/components/ClinicCard';
import { clinicPath } from '@/lib/site';
import {clinicDetailLink} from '@/lib/detail-navigation';
import MapContainer from '@/components/MapContainer';
import {clinicName,clinicAddress,hasClinicCoordinates} from '@/lib/clinic-contact';

interface ClinicSearchClientProps {
  lang?: any;
  selectedDepartment?: string;
  returnTo?: string;
  filteredClinics: any[];
  mapCenter: { lat: number; lng: number };
}

export default function ClinicSearchClient({
  lang,
  returnTo,
  selectedDepartment,
  filteredClinics,
  mapCenter: initialMapCenter
}: ClinicSearchClientProps) {
  const dict = getDictionary(lang);
  const [activeClinicId, setActiveClinicId] = useState<string | null>(null);
  const [currentMapCenter, setCurrentMapCenter] = useState(initialMapCenter);
  const [zoom, setZoom] = useState(13);
  const [view,setView]=useState<'list'|'map'>('list');

  // Sync state if initial map center changes due to department/location dynamic updates
  useEffect(() => {
    setCurrentMapCenter(initialMapCenter);
    setActiveClinicId(null);
    setView('list');
    setZoom(13);
  }, [initialMapCenter]);

  // Transform clinics to markers format
  const mapMarkers = filteredClinics.filter(hasClinicCoordinates).map((c) => ({
    id: c.id,
    name: clinicName(c),
    lat: c.latitude,
    lng: c.longitude,
    address: clinicAddress(c),
    telephone: c.telephone,
    detailHref: clinicDetailLink(clinicPath(c),returnTo,c.id),
    isPremium: c.is_premium
  }));

  const handleMarkerClick = (id: string) => {
    setActiveClinicId(id);
    setView('list');
    const clickedClinic = filteredClinics.find((c) => c.id === id);
    if (clickedClinic) {
      setCurrentMapCenter({ lat: clickedClinic.latitude, lng: clickedClinic.longitude });
      setZoom(15);
      
      // Scroll the matching card into view smoothly
      requestAnimationFrame(() => {
        const element = document.getElementById(`clinic-card-${id}`);
        if (element) {
          element.scrollIntoView({behavior:'smooth',block:'nearest'});
        }
      });
    }
  };

  const handleCardFocus = (id: string, lat: number, lng: number) => {
    setView('map');
    setActiveClinicId(id);
    setCurrentMapCenter({ lat, lng });
    setZoom(15);
    requestAnimationFrame(()=>{if(window.matchMedia('(max-width:1023px)').matches)document.getElementById('clinic-results-map')?.scrollIntoView({behavior:'smooth',block:'start'});});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start min-w-0">
      <div className="lg:hidden col-span-full flex gap-2 sticky top-28 sm:top-20 z-20 bg-slate-50 py-2" role="group" aria-label="Results view">
        <button type="button" aria-pressed={view==='list'} onClick={()=>setView('list')} className={`min-h-11 flex-1 border rounded-lg font-semibold ${view==='list'?'bg-slate-900 text-white':'bg-white'}`}>Clinic list</button>
        <button type="button" aria-pressed={view==='map'} onClick={()=>setView('map')} className={`min-h-11 flex-1 border rounded-lg font-semibold ${view==='map'?'bg-slate-900 text-white':'bg-white'}`}>Map</button>
      </div>
      {/* Clinic Cards List Column */}
      <div className={`lg:col-span-3 min-w-0 ${view==='map'?'hidden lg:block':''}`}>
        <div className="space-y-4 lg:max-h-[700px] lg:overflow-y-auto lg:pr-2">
        {filteredClinics.length > 0 ? (
          filteredClinics.map((clinic) => (
            <div 
              key={clinic.id} 
              id={`clinic-card-${clinic.id}`}
              className={`scroll-mt-28 rounded-xl transition-all duration-300 ${
                activeClinicId === clinic.id 
                  ? 'ring-2 ring-amber-500 ring-offset-2 scale-[1.01] shadow-md' 
                  : 'hover:scale-[1.005]'
              }`}
            >
              <ClinicCard returnTo={returnTo} clinic={clinic} selectedDepartment={selectedDepartment} onShowMap={()=>handleCardFocus(clinic.id,clinic.latitude,clinic.longitude)} />
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
      <div id="clinic-results-map" className={`scroll-mt-28 lg:col-span-2 min-w-0 lg:sticky lg:top-24 h-[420px] lg:h-[680px] ${view==='list'?'hidden lg:block':''}`}>
        <MapContainer 
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          center={currentMapCenter}
          zoom={zoom}
          markers={mapMarkers}
          selectedMarkerId={activeClinicId}
          onInfoWindowClose={() => setActiveClinicId(null)}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </div>
  );
}
