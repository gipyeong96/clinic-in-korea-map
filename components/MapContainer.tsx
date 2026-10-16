'use strict';
'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

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
    address?: string;
    telephone?: string;
    detailHref?: string;
  }>;
  selectedMarkerId?: string | null;
  onInfoWindowClose?: () => void;
  onMarkerClick?: (id: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function MapContainer({
  apiKey,
  center,
  zoom = 12,
  markers,
  selectedMarkerId,
  onInfoWindowClose,
  onMarkerClick
}: MapContainerProps) {
  const selectedMarker = markers.find(marker => marker.id === selectedMarkerId);
  const effectiveKey = apiKey || DEFAULT_API_KEY;
  
  // Try loading Google Maps JS API if Key is present
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: effectiveKey,
  });

  // Display error if Google Maps fails to load
  if (loadError) {
    return (
      <div className="relative w-full h-full min-h-[400px] bg-red-50 flex flex-col items-center justify-center border border-red-200 rounded-xl p-6 text-center">
        <span className="text-2xl mb-2">⚠️</span>
        <h4 className="font-bold text-red-800 text-sm mb-1">Google Maps Loading Error</h4>
        <p className="text-xs text-red-600 max-w-sm">
          {loadError.message || "Failed to load Google Maps script. Please verify domain restriction in Google Cloud Console."}
        </p>
      </div>
    );
  }

  // Mock Map UI for development if no Google Maps Key is supplied
  if (!effectiveKey || !isLoaded) {
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
        {selectedMarker && (
          <InfoWindow
            key={selectedMarker.id}
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={onInfoWindowClose}
            options={{ pixelOffset: new window.google.maps.Size(0, -32), maxWidth: 280 }}
          >
            <div className="max-w-[250px] p-1 text-slate-800">
              <h3 className="text-base font-bold mb-2">{selectedMarker.name}</h3>
              {selectedMarker.address && <p className="text-xs leading-relaxed mb-2">{selectedMarker.address}</p>}
              {selectedMarker.telephone && <p className="text-xs mb-3">{selectedMarker.telephone}</p>}
              {selectedMarker.detailHref && (
                <a href={selectedMarker.detailHref} className="inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-600">
                  View Details
                </a>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
