import { registeredEvidence } from '@/lib/clinic-evidence';
export default function RegistrationBadge({clinic,detailed=false}:{clinic:any;detailed?:boolean}) {
  const record=registeredEvidence(clinic);
  if (!record) return null;
  return <div className="my-3 text-xs">
    <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-semibold text-emerald-800">Registered for international patients</span>
    <p className="mt-1 text-slate-500"><a href="https://www.data.go.kr/data/3050000/fileData.do" target="_blank" rel="noreferrer" className="underline">KHIDI official registry</a> · As of {record.source_date}</p>
    {detailed && <p className="mt-1 text-slate-500">Listed name: {record.source_name} · Checked {record.checked_at}</p>}
  </div>;
}
