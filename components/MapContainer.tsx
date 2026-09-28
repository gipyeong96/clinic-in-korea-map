'use strict';
'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface Location {
  lat: number;
  lng: number;
}

interface MapContainerProps {
  apiKey?: string;
  center: Location;
  zoom?: number;
  markers: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    isPremium?: boolean;
  }>;
  onMarkerClick?: (id: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

export default function MapContainer({
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  center,
  zoom = 12,
  markers,
  onMarkerClick
}: MapContainerProps) {
  
  // Try loading Google Maps JS API if Key is present
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  // Mock Map UI for development if no Google Maps Key is supplied
  if (!apiKey || !isLoaded) {
    return (
      <div className="relative w-full h-full min-h-[400px] bg-slate-100 flex flex-col items-center justify-center border border-slate-200 rounded-xl overflow-hidden shadow-inner">
        {/* Mock Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Mock Markers */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center p-6">
          <div className="bg-white px-4 py-3 rounded-full shadow-md border border-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-sm font-semibold text-slate-700">Google Map Sandbox Mode</span>
          </div>
          
          <div className="flex gap-4 items-center justify-center flex-wrap">
            {markers.map((marker) => (
              <button
                key={marker.id}
                onClick={() => onMarkerClick?.(marker.id)}
                className={`relative px-3 py-2 rounded-lg shadow-sm border text-xs font-semibold flex flex-col items-center gap-1 transition transform hover:scale-105 ${
                  marker.isPremium 
                    ? 'bg-amber-500 border-amber-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <span>📍 {marker.name}</span>
                <span className="text-[9px] opacity-75">({marker.lat.toFixed(3)}, {marker.lng.toFixed(3)})</span>
              </button>
            ))}
          </div>
          
          <p className="text-xs text-slate-400 max-w-xs mt-2">
            Insert a valid Google Maps API Key in <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-600 font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable the live map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow border border-slate-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            onClick={() => onMarkerClick?.(marker.id)}
            icon={marker.isPremium ? {
              url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
            } : {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
