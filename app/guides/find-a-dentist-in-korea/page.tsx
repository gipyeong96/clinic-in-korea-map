import Link from 'next/link';
import CareGuideArticle from '@/components/CareGuideArticle';
import StationFinder from '@/components/StationFinder';
import {SITE_URL} from '@/lib/site';

const slug='find-a-dentist-in-korea';
const title='How to find a dentist in Korea';
const intro='Choose Dentistry and search near your location, a station or the area where you will stay. Compare contact details and reported specialist information, then confirm language support and your appointment directly with the clinic.';
export const metadata={title:'Find a Dentist in Korea: Nearby Search & Visit Guide | Korea Clinic Map',description:'Find dentists in Korea by location, station or city. Learn what to check about English communication, specialist information, appointments and costs.',alternates:{canonical:`${SITE_URL}/guides/${slug}`}};
const cities=[['seoul','Seoul'],['busan','Busan'],['incheon','Incheon'],['gyeonggi','Gyeonggi'],['daegu','Daegu'],['daejeon','Daejeon'],['gwangju','Gwangju'],['ulsan','Ulsan'],['jeju','Jeju']];
const sources=[
 {name:'HIRA hospital information dataset',url:'https://www.data.go.kr/data/15001698/openapi.do',scope:'Source of directory departments and reported specialist information; listings do not confirm live appointment availability.'},
 {name:'Medical Korea registration system',url:'https://www.medicalkorea.or.kr/en/registeredsystem',scope:'International-patient registration is a regulatory status, separate from confirmation of English communication.'},
 {name:'NHIS guidance for foreigners',url:'https://www.nhis.or.kr/english/wbheaa02900m01.do',scope:'Official information on foreign residents and National Health Insurance; check your own eligibility and benefits with NHIS.'},
 {name:'NHS: Toothache',url:'https://www.nhs.uk/symptoms/toothache/',scope:'General symptom and emergency warning signs. UK service numbers and NHS charging rules do not apply in Korea.'},
 {name:'Korea Tourism Organization: emergency services',url:'https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=248145',scope:'119 is the Korean fire and ambulance emergency number.'},
];
const linkClass='inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-3 text-sm font-semibold';

export default function Guide(){return <CareGuideArticle slug={slug} title={title} intro={intro} sources={sources} updated="2026-10-26">
 <nav aria-label="Find dental clinics" className="grid sm:grid-cols-2 gap-3">
  <Link href="/nearby?department=dentistry" className={`${linkClass} bg-slate-900 text-white`}>Find dentists near me</Link>
  <Link href="/clinics/dentistry/all" className={linkClass}>Browse dental clinics in Korea</Link>
 </nav>
 <section className="space-y-3" aria-labelledby="find-dentist"><h2 id="find-dentist" className="text-2xl font-bold">How do I find a dentist near me in Korea?</h2>
  <p>Open <Link href="/nearby?department=dentistry" className="underline">nearby dental search</Link>. Dentistry is already selected. Choose a radius, then press “Use my location” to allow access. Results are ordered by straight-line distance, which can differ from walking distance.</p>
  <p>Planning ahead or keeping location access off? Choose a city below or use a station. You can read a clinic’s details and directions before deciding where to go. Location, services and communication needs all matter; the closest listing is not automatically the best match.</p>
  <nav aria-label="Dental clinics by city" className="flex flex-wrap gap-2">{cities.map(([slug,label])=><Link key={slug} href={`/clinics/dentistry/${slug}`} className={`${linkClass} bg-white`}>Dentists in {label}</Link>)}</nav>
  <Link href="/areas?department=dentistry" className="inline-flex min-h-11 items-center underline">Choose another province or city →</Link>
 </section>
 <section className="space-y-3" aria-labelledby="station-dentist"><h2 id="station-dentist" className="text-2xl font-bold">Can I find a dental clinic near a subway or railway station?</h2>
  <p>Search a station’s English or Korean name. Selecting a station opens dental results for that station, with a radius you can adjust. Distances use dated official station coordinates, not an individual exit or a live walking route.</p>
  <StationFinder department="dentistry"/>
 </section>
 <section className="space-y-3" aria-labelledby="english-dentist"><h2 id="english-dentist" className="text-2xl font-bold">How can I check whether a dentist can communicate in English?</h2>
  <p>Contact the exact branch and ask about your appointment. An English website, an English listing name or “Registered for international patients” does not by itself confirm an English-speaking dentist or an interpreter.</p>
  <p>You can ask: “Can the dentist explain my examination and treatment options in English? If an interpreter is needed, can you arrange one, and is there an extra charge?” Also confirm communication for consent forms, costs and follow-up.</p>
 </section>
 <section className="space-y-3" aria-labelledby="compare-dentists"><h2 id="compare-dentists" className="text-2xl font-bold">What should I compare in dental search results?</h2>
  <dl className="divide-y rounded-xl border bg-white px-4">
   <div className="py-3"><dt className="font-bold">Reported department and specialists</dt><dd className="mt-1">Dentistry is a reported department. A positive specialist count is separate information; it does not prove that a particular procedure is available on your visit date. Ask which clinician would assess your concern.</dd></div>
   <div className="py-3"><dt className="font-bold">International-patient registration</dt><dd className="mt-1">This filter identifies records matched to the official registry. Check the source date. It is not a quality ranking, language guarantee or insurance benefit.</dd></div>
   <div className="py-3"><dt className="font-bold">Branch, station and telephone</dt><dd className="mt-1">Match the clinic name with the Korean address and telephone. Use directions to plan the actual journey, especially when several branches share a name.</dd></div>
  </dl>
  <p>Missing information is a reason to check directly, not a negative assessment. You can <Link href="/my-clinics" className="underline">save and compare clinics</Link> in this browser, or read <Link href="/guides/understand-clinic-information" className="underline">what the directory labels mean</Link>.</p>
 </section>
 <section className="space-y-3" aria-labelledby="booking-dentist"><h2 id="booking-dentist" className="text-2xl font-bold">What should I ask before booking a dental visit?</h2>
  <ul className="list-disc pl-5 space-y-2"><li>“Can you assess my concern, and is an appointment required? What is the last check-in time?”</li><li>“What is the initial examination fee? Are X-rays or other tests charged separately?”</li><li>“Will you explain the options and estimated total cost before treatment? Could follow-up visits be needed?”</li><li>“Can you process my insurance, and what identification or documents should I bring?”</li></ul>
  <p>Fees and coverage depend on your circumstances and the proposed care. Ask the clinic for an estimate and check benefits with <a href="https://www.nhis.or.kr/english/wbheaa02900m01.do" className="underline" target="_blank" rel="noopener noreferrer">NHIS</a> or your insurer. We do not provide fixed prices or infer coverage from a directory label.</p>
 </section>
 <section className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4" aria-labelledby="urgent-dentist"><h2 id="urgent-dentist" className="text-2xl font-bold">When should I seek urgent help instead of browsing?</h2>
  <p>Tooth pain with swelling around the eye or neck, or mouth or neck swelling that makes breathing, swallowing or speaking difficult, needs emergency assessment. In Korea, call <a href="tel:119" className="font-bold underline">119</a> for an emergency ambulance. Do not wait for a routine clinic booking. <a href="https://www.nhs.uk/symptoms/toothache/" target="_blank" rel="noopener noreferrer" className="underline">Symptom source: NHS</a>; <a href="https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=248145" target="_blank" rel="noopener noreferrer" className="underline">Korea emergency number: KTO</a>.</p>
  <p>This guide cannot assess your symptoms. For other dental concerns, contact a dentist and describe what is happening so they can advise on appointment urgency.</p>
 </section>
 <section className="space-y-3 border-t pt-5"><h2 className="text-xl font-bold">Ready to make a short list?</h2><p>Start with your location or travel area, then call the clinic to confirm your visit.</p><nav aria-label="Continue your dental search" className="flex flex-wrap gap-3"><Link href="/nearby?department=dentistry" className={`${linkClass} bg-slate-900 text-white`}>Find dentists near me</Link><Link href="/areas?department=dentistry" className={linkClass}>Find dentists by area</Link></nav></section>
 </CareGuideArticle>;}
