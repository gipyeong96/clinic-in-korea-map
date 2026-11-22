'use client';

import { useState } from 'react';

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isPremium?: boolean;
  address?: string;
  telephone?: string;
  detailHref?: string;
}

interface Props {
  apiKey?: string;
  center: { lat: number; lng: number };
  zoom?: number;
  markers: MapMarker[];
  selectedMarkerId?: string | null;
  onInfoWindowClose?: () => void;
  onMarkerClick?: (id: string) => void;
}

export default function MapContainer({
  center,
  markers,
  selectedMarkerId,
  onMarkerClick,
}: Props) {
  const [localSelection, setLocalSelection] = useState('');
  const selection = selectedMarkerId === undefined ? localSelection : selectedMarkerId;
  const selected = markers.find(marker => marker.id === selection)
    ?? (markers.length === 1 ? markers[0] : undefined);
  const { lat, lng } = selected ?? center;
  const bounds = [lng - 0.015, lat - 0.01, lng + 0.015, lat + 0.01].join(',');
  const params = new URLSearchParams({ bbox: bounds, layer: 'mapnik' });
  if (selected) params.set('marker', `${lat},${lng}`);

  const mapLink = `https://www.openstreetmap.org/${selected ? `?mlat=${lat}&mlon=${lng}` : ''}#map=16/${lat}/${lng}`;

  return (
    <div className="h-full min-h-[320px] flex flex-col border rounded-xl overflow-hidden bg-white">
      {markers.length > 1 && (
        <label className="flex items-center gap-2 p-3 text-sm">
          <span className="shrink-0">Clinic on map</span>
          <select
            className="min-w-0 flex-1 rounded border p-2"
            value={selected?.id ?? ''}
            onChange={event => {
              const id = event.target.value;
              setLocalSelection(id);
              onMarkerClick?.(id);
            }}
          >
            <option value="" disabled>Choose a clinic</option>
            {markers.map(marker => <option key={marker.id} value={marker.id}>{marker.name}</option>)}
          </select>
        </label>
      )}
      <iframe
        title={selected ? `Map location of ${selected.name}` : 'Area map'}
        src={`https://www.openstreetmap.org/export/embed.html?${params}`}
        loading="lazy"
        className="w-full flex-1 min-h-[260px] border-0"
      />
      <p className="text-xs p-3 border-t text-slate-600">
        {selected?.name ?? 'Area map'}{' '}
        <a className="underline" target="_blank" rel="noreferrer" href={mapLink}>Open map</a>
      </p>
    </div>
  );
}
