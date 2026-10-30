export default function EmergencyDepartmentScope(){
 return <aside aria-label="Emergency medicine directory scope" className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2 text-sm">
  <p>This list uses HIRA-reported emergency medicine departments. A reported department does not confirm an operating emergency room, current opening hours or patient acceptance.</p>
  <a href="/emergency" className="min-h-11 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">Find official emergency institution records →</a>
  <p>For an ambulance in Korea, <a href="tel:119" className="font-bold underline">call 119</a>. Do not delay an emergency call to search this list. The official directory is also not live acceptance information.</p>
 </aside>;
}
