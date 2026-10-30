import UrologyVisitGuide from '@/components/UrologyVisitGuide';
import {urologyVisitGuides,visitGuidePath} from '@/lib/urology-visit-guides';
import {SITE_URL} from '@/lib/site';
const guide=urologyVisitGuides[0];
export const metadata={title:guide.title,description:guide.description,alternates:{canonical:SITE_URL+visitGuidePath(guide.slug)}};
export default function Page(){return <UrologyVisitGuide guide={guide}/>;}
