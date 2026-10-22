'use client';

import React, { useState, useEffect } from 'react';
import { Locale, getDictionary } from '@/lib/translation';
import {SavedComparisonNotice} from '@/components/ClinicLibrary';
import ClinicCard from '@/components/ClinicCard';
import { clinicPath } from '@/lib/site';
import {clinicDetailLink} from '@/lib/detail-navigation';
import MapContainer from '@/components/MapContainer';
import {clinicName,clinicAddress,hasClinicCoordinates} from '@/lib/clinic-contact';

interface ClinicSearchClientProps {
  lang?: any;
  selectedDepartment?: string;
  returnTo?: string;
  mapPage: {page:number;previous?:string;next?:string};
  initialMapView?:boolean;
  filteredClinics: any[];
  mapCenter: { lat: number; lng: number };
}

export default function ClinicSearchClient({
  lang,
  returnTo,
  selectedDepartment,
  mapPage,
  initialMapView=false,
  filteredClinics,
  mapCenter: initialMapCenter
}: ClinicSearchClientProps) {
  const dict = getDictionary(lang);
  const [activeClinicId, setActiveClinicId] = useState<string | null>(null);
  const [currentMapCenter, setCurrentMapCenter] = useState(initialMapCenter);
  const [zoom, setZoom] = useState(13);
  const [view,setView]=useState<'list'|'map'>(initialMapView?'map':'list');

  // Sync state if initial map center changes due to department/location dynamic updates
  useEffect(() => {
    setCurrentMapCenter(initialMapCenter);
    setActiveClinicId(null);
    setView(initialMapView?'map':'list');
    setZoom(13);
  }, [initialMapCenter,initialMapView]);

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
    setView('map');
    const clickedClinic = filteredClinics.find((c) => c.id === id);
    if (clickedClinic) {
      setCurrentMapCenter({ lat: clickedClinic.latitude, lng: clickedClinic.longitude });
      setZoom(15);
      
    }
  };

  const selectedClinic=mapMarkers.find(marker=>marker.id===activeClinicId);
  const showSelectedCard=()=>{
    setView('list');
    requestAnimationFrame(()=>document.getElementById(`clinic-card-${activeClinicId}`)?.scrollIntoView({behavior:'smooth',block:'nearest'}));
  };

  const handleCardFocus = (id: string, lat: number, lng: number) => {
    setView('map');
    setActiveClinicId(id);
    setCurrentMapCenter({ lat, lng });
    setZoom(15);
    requestAnimationFrame(()=>{if(window.matchMedia('(max-width:1023px)').matches)document.getElementById('clinic-results-map')?.scrollIntoView({behavior:'smooth',block:'start'});});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start min-w-0 pb-28">
      {view==='list'&&<SavedComparisonNotice/>}
      <div className="lg:hidden col-span-full flex gap-2 sticky top-20 z-20 bg-slate-50 py-2" role="group" aria-label="Results view">
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
              className={`clinic-result-anchor rounded-xl transition-all duration-300 ${
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
      <div id="clinic-results-map" className={`clinic-result-anchor lg:col-span-2 min-w-0 lg:sticky lg:top-24 space-y-3 ${view==='list'?'hidden lg:block':''}`}>
        <section aria-label="Map result coverage" className="rounded-xl border bg-white p-3 space-y-2 text-sm"><p role="status" className="font-semibold">Page {mapPage.page} · {mapMarkers.length} of {filteredClinics.length} clinic profiles on this page have map locations.</p><p className="text-xs text-slate-600">The map covers this page only, not all search results.{mapMarkers.length<filteredClinics.length?' Profiles without usable coordinates remain in the clinic list.':''}</p><nav aria-label="Map result pages" className="flex flex-wrap items-center gap-3">{mapPage.previous&&<a href={mapPage.previous} rel="prev" className="min-h-11 inline-flex items-center rounded-lg border px-3 font-semibold">Previous map page</a>}{mapPage.next?<a href={mapPage.next} rel="next" className="min-h-11 inline-flex items-center rounded-lg border px-3 font-semibold">Next map page</a>:<span className="text-xs text-slate-500">No further result page.</span>}</nav></section>
        <section aria-label="Selected clinic on map" aria-live="polite" className="rounded-xl border border-slate-300 bg-white p-4 space-y-2 break-words">
          {selectedClinic?<><p className="text-xs font-semibold text-slate-500">Selected clinic</p><h2 className="font-bold text-slate-900">{selectedClinic.name}</h2><p className="text-sm text-slate-600">{selectedClinic.address||'Address not provided'}</p><div className="flex flex-wrap gap-2"><a href={selectedClinic.detailHref} className="min-h-11 inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">View clinic details</a><button type="button" onClick={showSelectedCard} className="min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold">Show in clinic list</button><button type="button" onClick={()=>setActiveClinicId(null)} className="min-h-11 px-2 py-2 text-sm underline">Clear selection</button></div></>:<p className="text-sm text-slate-600">Choose a marker or “Show on map” on a clinic card to see its name, address and details here.</p>}
        </section>
        <div className="h-[360px] lg:h-[480px]">
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
    </div>
  );
}
