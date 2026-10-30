import StiVisitGuide from '@/components/StiVisitGuide';
import {stiGuides} from '@/lib/sti-visit-guides';
import {SITE_URL} from '@/lib/site';
const guide=stiGuides[1];
export const metadata={title:guide.title,description:guide.description,alternates:{canonical:SITE_URL+'/guides/'+guide.slug}};
export default function Page(){return <StiVisitGuide guide={guide}/>;}
