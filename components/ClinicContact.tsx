'use client';
import {useState} from 'react';
import {clinicAddress,clinicDirections,clinicPhone} from '@/lib/clinic-contact';
export default function ClinicContact({clinic,compact=false}:{clinic:any;compact?:boolean}){
  const phone=clinicPhone(clinic.telephone),address=clinicAddress(clinic),directions=clinicDirections(clinic);
  const [copyStatus,setCopyStatus]=useState('');
  async function copyAddress(){try{await navigator.clipboard.writeText(address);setCopyStatus('Address copied');}catch{setCopyStatus('Select the address above and copy it.');}}
  return <section aria-label="Contact and directions" className="space-y-2">
    {!compact&&<p className="text-sm text-slate-600">Use the Korean address when taking a taxi or contacting the clinic.</p>}
    <div className="flex flex-wrap gap-2">
      {phone.href&&<a href={phone.href} aria-label={`Call ${phone.display}`} className="min-h-11 flex-1 inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Call clinic</a>}
      {directions&&<a href={directions} target="_blank" rel="noopener noreferrer" className="min-h-11 flex-1 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">Directions</a>}
      {!compact&&address&&<button type="button" onClick={copyAddress} className="min-h-11 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">Copy address</button>}
    </div>
    {!phone.href&&<p className="text-xs text-slate-500">{phone.reason==='missing'?'Phone number not provided.':phone.reason==='area-code-missing'?'Phone area code is missing. Confirm the full number before calling.':'Phone number needs confirmation.'}</p>}
    {phone.note&&<p className="text-xs text-slate-500">{phone.note}</p>}
    {copyStatus&&<p role="status" className="text-xs text-slate-600">{copyStatus}</p>}
  </section>;
}
