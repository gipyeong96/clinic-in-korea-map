'use client';
import {GoogleMap,useJsApiLoader,Marker,InfoWindow} from '@react-google-maps/api';
import {clinicPhone} from '@/lib/clinic-contact';
interface MapMarker {id:string;name:string;lat:number;lng:number;isPremium?:boolean;address?:string;telephone?:string;detailHref?:string}
interface Props {apiKey?:string;center:{lat:number;lng:number};zoom?:number;markers:MapMarker[];selectedMarkerId?:string|null;onInfoWindowClose?:()=>void;onMarkerClick?:(id:string)=>void}
function AreaMap(props:Props){
 const selected=props.markers.find(m=>m.id===props.selectedMarkerId);
 const {lat,lng}=selected||props.center;
 const bounds=[lng-.015,lat-.01,lng+.015,lat+.01].join(',');
 const src=`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bounds)}&layer=mapnik${selected?`&marker=${lat}%2C${lng}`:''}`;
 return <div className="h-full min-h-[320px] flex flex-col border rounded-xl overflow-hidden bg-white">
   <iframe title={selected?`Map location of ${selected.name}`:'Area map'} src={src} loading="lazy" className="w-full flex-1 min-h-[260px] border-0" />
   <p className="text-xs p-3 border-t text-slate-600">{selected?selected.name:'Choose “Show on map” on a clinic card to mark its location.'} <a className="underline" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/${selected?`?mlat=${lat}&mlon=${lng}`:''}#map=16/${lat}/${lng}`}>Open map</a></p>
 </div>;
}
function GoogleClinicMap(props:Props&{apiKey:string}){
 const {isLoaded,loadError}=useJsApiLoader({id:'google-map-script',googleMapsApiKey:props.apiKey});
 const selected=props.markers.find(m=>m.id===props.selectedMarkerId);
 if(loadError)return <AreaMap {...props} />;
 if(!isLoaded)return <div role="status" className="h-full min-h-[320px] rounded-xl border bg-slate-100 flex items-center justify-center">Loading map…</div>;
 return <div className="h-full min-h-[320px] rounded-xl overflow-hidden border">
  <GoogleMap mapContainerStyle={{width:'100%',height:'100%'}} center={props.center} zoom={props.zoom||13} options={{zoomControl:true,streetViewControl:false,mapTypeControl:false,gestureHandling:'cooperative'}}>
   {props.markers.map(m=><Marker key={m.id} position={{lat:m.lat,lng:m.lng}} title={m.name} icon={{url:`https://maps.google.com/mapfiles/ms/icons/${m.isPremium?'orange':'red'}-dot.png`}} onClick={()=>props.onMarkerClick?.(m.id)} />)}
   {selected&&<InfoWindow position={{lat:selected.lat,lng:selected.lng}} onCloseClick={props.onInfoWindowClose} options={{maxWidth:260}}><div className="max-w-[240px] p-1 text-slate-800 break-words"><h3 className="font-bold mb-2">{selected.name}</h3><p className="text-xs mb-2">{selected.address}</p>{clinicPhone(selected.telephone).display&&<p className="text-xs mb-3">{clinicPhone(selected.telephone).display}</p>}{selected.detailHref&&<a className="min-h-11 inline-flex items-center rounded-lg bg-amber-500 px-4 font-semibold text-sm" href={selected.detailHref}>View details</a>}</div></InfoWindow>}
  </GoogleMap>
 </div>;
}
export default function MapContainer(props:Props){
 const key=props.apiKey||process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
 return key?<GoogleClinicMap {...props} apiKey={key}/>:<AreaMap {...props}/>;
}
