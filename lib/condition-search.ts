export const conditionCatalog=[
 {slug:'cystitis',name:'Cystitis',source:'방광염',aliases:['cystitis','bladder inflammation','방광염'],note:'Cystitis describes bladder inflammation. UTI is a broader term and is not used as an equivalent search label.',question:'Ask whether your symptoms need testing and whether follow-up is available.',url:'https://www.nhs.uk/conditions/urinary-tract-infections-utis/'},
 {slug:'bph',name:'Enlarged prostate (BPH)',source:'전립선증식증',aliases:['bph','benign prostatic hyperplasia','enlarged prostate','prostatic hyperplasia','전립선비대증','전립선증식증'],note:'BPH means benign prostatic hyperplasia. A historical record does not identify which procedures a clinic currently offers.',question:'Ask about assessment, medication and procedure options appropriate to your situation.',url:'https://www.nhs.uk/conditions/enlarged-prostate/'},
 {slug:'urinary-stones',name:'Urinary stones',source:'요로결석증',aliases:['urinary stones','urinary stone','kidney stones','kidney stone','urolithiasis','요로결석','요로결석증'],note:'Kidney-stone searches lead to the broader HIRA urinary-stone category. Records do not specify the stone location or available procedures.',question:'Ask whether imaging and stone treatment are currently available and where urgent care is provided.',url:'https://www.nhs.uk/conditions/kidney-stones/'},
 {slug:'neurogenic-bladder',name:'Neurogenic bladder',source:'신경인성 방광',aliases:['neurogenic bladder','neurogenic bladder disorder','신경인성 방광','신경인성방광'],note:'This is a specific source category, not a synonym for all bladder symptoms or overactive bladder.',question:'Ask about assessment, ongoing follow-up and coordination with your existing care team.',url:'https://meshb.nlm.nih.gov/record/ui?ui=D001750'},
 {slug:'sti',name:'Sexually transmitted infections (STIs)',source:'성매개감염병',aliases:['sexually transmitted infections','sexually transmitted infection','sti','stis','std','stds','성매개감염병','성병'],note:'This broad source category does not identify a particular infection, test or current service.',question:'Ask which tests are available, when results are returned and how follow-up is arranged.',url:'https://www.nhs.uk/conditions/sexually-transmitted-infections-stis/'},
] as const;
export const conditionAreas=[{slug:'gangnam',name:'Gangnam area',scope:'Gangnam-gu and Seocho-gu',general:'/clinics/urology/gangnam'},{slug:'jamsil',name:'Jamsil area',scope:'Jamsil-dong and Sincheon-dong in Songpa-gu',general:'/clinics/urology/jamsil-station'}] as const;
export function conditionPath(condition:string,area:string){return `/conditions/${condition}/${area}`;}
export function matchConditionSearch(query:string){
 let remaining=query.toLowerCase().trim().replace(/[?,.!]/g,' ');let found:typeof conditionCatalog[number]|undefined;
 for(const c of conditionCatalog){for(const alias of [...c.aliases].sort((a,b)=>b.length-a.length)){
  const escaped=alias.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const re=new RegExp(`(^|\\s)${escaped}(?=$|\\s)`,'i');
  if(re.test(remaining)){if(found&&found.slug!==c.slug)return null;found=c;remaining=remaining.replace(re,' ');break;}
 }}
 if(!found)return null;
 const areas=conditionAreas.filter(a=>new RegExp(a.slug==='gangnam'?'(^|\\s)(gangnam|강남)(?=$|\\s)':'(^|\\s)(jamsil|잠실)(?=$|\\s)').test(remaining));
 const nearbyPattern=/\b(?:near[\s-]+me|around\s+me|nearby)\b/gi;
 const nearby=new RegExp(nearbyPattern.source,'i').test(remaining);
 remaining=remaining.replace(nearbyPattern,' ').replace(/\b(gangnam|jamsil|in|for|clinics?|hospitals?|treatment)\b|강남|잠실/g,' ').trim();
 if(remaining)return null;
 return {condition:found,areas:areas.length?areas:conditionAreas,nearby};
}
