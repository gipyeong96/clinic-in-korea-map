import {CalendarDays} from 'lucide-react';
import {weekendHours,hoursLabel} from '@/lib/weekend-hours';
import {clinicPhone} from '@/lib/clinic-contact';

export default function ClinicWeekendHours({id,name,address,telephone}:{id:string;name:string;address:string;telephone:string}){
 const record=weekendHours(id,name,address,telephone);
 if(!record)return null;
 const phone=clinicPhone(record.telephone);
 return <section aria-labelledby="weekend-hours-heading" className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm space-y-3">
  <h2 id="weekend-hours-heading" className="flex items-center gap-2 text-lg font-bold"><CalendarDays aria-hidden="true" className="h-5 w-5 text-amber-800"/>Weekend hours</h2>
  <dl className="grid grid-cols-2 gap-x-4 gap-y-2"><dt>Saturday</dt><dd>{hoursLabel(record.saturday)}</dd><dt>Sunday</dt><dd>{hoursLabel(record.sunday)}</dd></dl>
  <p className="text-slate-600">Reported schedule, Korea time. Call before visiting to confirm today’s hours and last registration time. Missing hours do not mean the clinic is closed.</p>
  {phone.href&&<a className="inline-flex min-h-11 items-center rounded-lg border px-3 font-semibold" href={phone.href}>Call to confirm hours</a>}
  <p className="text-xs text-slate-500"><a href={record.scheduleSource||'https://www.data.go.kr/data/15000736/openapi.do'} target="_blank" rel="noreferrer" className="underline">{record.scheduleSourceLabel||'National Medical Center public data'}</a> · Checked {record.checkedAt}. The provider’s schedule update date is not supplied.</p>
  {record.telephoneSource&&<p className="text-xs text-slate-500">Contact number from the <a href={record.telephoneSource} target="_blank" rel="noreferrer" className="underline">official clinic website</a>.</p>}
 </section>;
}
