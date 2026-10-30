import Link from 'next/link';
import PartnerClinicCards from '@/components/PartnerClinicCards';
import MobileCardDetails from '@/components/MobileCardDetails';
import {goldmanBranches} from '@/lib/goldman';
import {SITE_URL,serializeJsonLd} from '@/lib/site';
import {urologyVisitGuides,visitGuideUpdated,visitGuidePath,type UrologyVisitGuide as Guide} from '@/lib/urology-visit-guides';

const button = 'inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
const section = 'scroll-mt-24 rounded-2xl border bg-white p-4 sm:p-5 space-y-3';
export default function UrologyVisitGuide({guide:g}:{guide:Guide}) {
 const vasectomy = g.procedure === 'vasectomy';
 return <article className="max-w-3xl mx-auto px-4 py-5 sm:py-8 space-y-5 break-words text-sm sm:text-base leading-relaxed">
  <Link href="/guides" className="inline-flex min-h-11 items-center underline">← Care guides</Link>
  <header className="space-y-3">
   <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Urology · Visit planning</p>
   <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{g.title}</h1>
   <p className="text-slate-700">{g.intro}</p>
   <p className="text-xs text-slate-500">Clinic in Korea editorial team · Updated {visitGuideUpdated} · Not medically reviewed</p>
   <div className="rounded-xl bg-slate-50 border p-4 space-y-2">
    <p className="font-semibold">Five branches · English consultations</p>
    <p>Goldman Urology offers {g.procedure} and English consultations at Gangnam, Seoul Station, Incheon, Dongtan and Jamsil. Contact your preferred branch to arrange a consultation and confirm appointment availability.</p>
    <p className="text-xs text-slate-600">Goldman is a consulting client of Clinic Map. This commercial relationship is not a clinical quality ranking.</p>
   </div>
   <div className="grid sm:grid-cols-2 gap-2"><a className={button+' bg-slate-900 text-white'} href="#branches">Choose a branch & contact</a><a className={button} href={g.official} target="_blank" rel="sponsored noopener noreferrer">Official {g.procedure} information ↗</a></div>
  </header>
  <nav aria-label="Visit guide sections" className="flex flex-wrap gap-2">{[['consultation','Consultation'],['preparation','Prepare'],['costs','Costs'],['follow-up','Follow-up']].map(([id,label])=><a key={id} className="min-h-11 inline-flex items-center rounded-full border px-3 py-2 text-sm" href={'#'+id}>{label}</a>)}</nav>
  <section id="consultation" className={section}>
   <h2 className="text-lg sm:text-xl font-bold">{vasectomy?'Understand the decision first':'What to discuss at your consultation'}</h2>
   <p>{g.overview}</p>
   <p>Goldman’s official English website describes its {vasectomy?'no-scalpel vasectomy':'laser circumcision'} service. Ask your clinician which technique is suitable for you, what it involves and what benefits and risks to expect.</p>
  </section>
  <section id="preparation" className={section}>
   <h2 className="text-lg sm:text-xl font-bold">Before your appointment</h2>
   <p>Share your medical history and travel dates with the clinic.</p>
   <MobileCardDetails label="What to tell the clinic" hashTarget="preparation"><ul className="list-disc pl-5 space-y-2">{g.preparation.map(q=><li key={q}>{q}</li>)}</ul></MobileCardDetails>
   <p>Ask about preparation, including instructions about eating, drinking and travelling home after treatment. Follow the clinic’s instructions and do not stop prescribed medicines on your own.</p>
  </section>
  <section id="costs" className={section}>
   <h2 className="text-lg sm:text-xl font-bold">Request a written estimate</h2>
   <p>Ask for an itemised estimate for your proposed treatment before agreeing to costs.</p>
   <MobileCardDetails label="What should the quote include?" hashTarget="costs"><p>{g.quote}</p></MobileCardDetails>
  </section>
  <section id="follow-up" className={section}>
   <h2 className="text-lg sm:text-xl font-bold">{vasectomy?'Arrange the semen test before you travel':'Plan your recovery and follow-up'}</h2>
   {vasectomy?<><div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2"><p className="font-bold">Vasectomy is not effective immediately.</p><p>Follow your clinician’s instructions on additional contraception until post-vasectomy semen testing confirms success.</p></div><p>If you are visiting Korea briefly, agree on this follow-up plan before the procedure. Having the operation and completing contraceptive follow-up are separate steps.</p></>:<p>Recovery and travel plans need individual advice. Confirm your follow-up arrangements before committing to a procedure date.</p>}
   <MobileCardDetails label={vasectomy?'Semen testing questions':'Recovery and travel questions'} hashTarget="follow-up"><ul className="list-disc pl-5 space-y-2">{g.followUp.map(q=><li key={q}>{q}</li>)}</ul></MobileCardDetails>
   {vasectomy?<p>Ask for written instructions covering wound care, pain relief, activity, sexual activity and symptoms that need medical attention. Confirm when a review is needed, how travel timing will be assessed and whom to contact after returning home.</p>:<aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2"><p>Circumcision carries risks, including bleeding, infection and changes in sensation or appearance. Your clinician should explain these before you decide.</p><p>Seek prompt medical attention for bleeding that does not stop, fever, worsening pain or difficulty passing urine.</p></aside>}
  </section>
  <section id="branches" className="scroll-mt-24 space-y-3">
   <h2 className="text-xl font-bold">Choose your Goldman branch</h2>
   <p>{vasectomy?'Vasectomy':'Circumcision'} and English consultations are available at all five branches. Open a branch profile for contact details.</p>
   <PartnerClinicCards ids={goldmanBranches.map(b=>b.id)}/>
  </section>
  <section id="inquiry" className={section}>
   <h2 className="text-lg sm:text-xl font-bold">Start your inquiry</h2>
   <p>Use this message as a starting point. Replace the bracketed details before sending it through the clinic’s contact channel.</p>
   <blockquote className="rounded-xl border-l-4 border-slate-300 bg-slate-50 p-4 select-text">{g.inquiry}</blockquote>
   <a href="https://www.gold-man.com/ennew/" target="_blank" rel="sponsored noopener noreferrer" className={button}>Official website & inquiry form ↗</a>
  </section>
  <nav aria-label="Related visit guides" className="space-y-2">{urologyVisitGuides.filter(other=>other.slug!==g.slug).map(other=><Link key={other.slug} href={visitGuidePath(other.slug)} className="flex min-h-11 items-center underline">{other.shortTitle} →</Link>)}<Link href="/guides/urology-care/bph" className="flex min-h-11 items-center underline">BPH treatment & surgery planning →</Link></nav>
  <footer className="border-t pt-4 space-y-3 text-xs sm:text-sm text-slate-600">
   <h2 className="text-base font-bold">Sources and scope</h2>
   <ul className="list-disc pl-5 space-y-2"><li><a href={g.official} rel="sponsored" className="underline">Goldman {g.officialName}</a> — partner-published service information; reviewed through a search-indexed copy on {visitGuideUpdated}.</li><li><a href={g.reference} className="underline">{g.referenceName}</a> — independent general medical context, checked {visitGuideUpdated}.</li></ul>
   <p>Availability of {g.procedure} and English consultations at all five branches was confirmed by Goldman’s representative on {visitGuideUpdated}. This does not confirm availability on a particular date.</p>
   <p>Goldman Urology is a consulting client of Clinic Map. This guide supports visit planning and does not replace an individual medical assessment, quotation or clearance for travel.</p>
  </footer>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd({'@context':'https://schema.org','@type':'Article',headline:g.title,description:g.description,datePublished:visitGuideUpdated,dateModified:visitGuideUpdated,author:{'@type':'Organization',name:'Clinic in Korea editorial team'},mainEntityOfPage:SITE_URL+visitGuidePath(g.slug)})}}/>
 </article>;
}
