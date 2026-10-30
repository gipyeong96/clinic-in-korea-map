export default function ClinicSearchScope({location,station,radius,nearbyLabel}:{location:string;station?:string;radius:number;nearbyLabel:string}){
 return <p className="text-sm text-slate-600">
  {station?<>Results are within {radius.toLocaleString()} m of {station}, measured in a straight line.</>:<>This list covers {location === 'Korea' ? 'Korea' : `addresses in ${location}`}; it is not centred on your current location.</>}
  {' '}Use “{nearbyLabel}” above for a search around your location. Location access starts only after you choose “Use my location”. Distances to stations are between the clinic and the station, not from you or a walking route.
 </p>;
}
