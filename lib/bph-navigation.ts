export const bphGuidePath='/guides/urology-care/bph';
export const bphGuideUpdated='2026-10-28';
export const bphProcedures=[
 {slug:'holep',name:'HoLEP',aliases:['holmium laser enucleation of the prostate','holmium laser enucleation','holep','홀렙 수술','홀렙수술','홀렙'],summary:'Holmium laser enucleation of prostate tissue, described on Goldman’s official English site.',question:'Who would perform the procedure at the chosen branch? Ask about anaesthesia, catheter removal, tissue examination and follow-up.',official:'https://www.gold-man.com/ennew/prostate/holep'},
 {slug:'aquablation',name:'Aquablation',aliases:['aquablation','aquabeam','아쿠아블레이션 수술','아쿠아블레이션수술','아쿠아블레이션'],summary:'A waterjet procedure described on Goldman’s official English site.',question:'Is the procedure currently available at this exact branch? Ask about the planned treatment, admission, catheter care and follow-up.',official:'https://www.gold-man.com/ennew/prostate/aquablation'},
 {slug:'rezum',name:'Rezum (Rezūm)',aliases:['water vapour therapy','water vapor therapy','rezum therapy','rezum','리줌 시술','리줌 수술','리줌시술','리줌수술','리줌'],summary:'Water-vapour therapy described on Goldman’s official English site.',question:'Ask about anaesthesia or sedation, catheter management, the expected follow-up schedule and support if symptoms change after returning home.',official:'https://www.gold-man.com/ennew/prostate/rezum'},
] as const;
const regions=[['seoul station','서울역','seoul-station','Seoul Station'],['gangnam','강남','gangnam','Gangnam area'],['jamsil','잠실','jamsil-station','Jamsil Station area'],['incheon','인천','incheon','Incheon'],['dongtan','동탄','dongtan','Dongtan'],['seoul','서울','seoul','Seoul'],['busan','부산','busan','Busan']] as const;
function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').normalize('NFC').toLowerCase().replace(/[?,.!/()–-]/g,' ').replace(/\s+/g,' ').trim();}
// Recognize navigation intent, not a diagnosis or a list of procedure providers.
export function matchBphSearch(query:string){
 if(query.length>200)return null;
 let remaining=normalize(query).replace(/전립선\s+(비대증|증식증)/g,'전립선$1').replace(/(전립선비대증|전립선증식증|홀렙|아쿠아블레이션|리줌)((?:치료|수술|시술|비용|회복)+)(?=\s|$)/g,(_,name,suffix)=>name+suffix.replace(/치료|수술|시술|비용|회복/g,' $&'));
 const consume=(alias:string)=>{const escaped=normalize(alias).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const pattern=new RegExp(`(^|\\s)${escaped}(?=\\s|$)`,'g');const found=pattern.test(remaining);remaining=remaining.replace(pattern,' ').replace(/\s+/g,' ').trim();return found;};
 const procedures=bphProcedures.filter(p=>{let found=false;for(const alias of [...p.aliases].sort((a,b)=>b.length-a.length))if(consume(alias))found=true;return found;});
 let bph=false;for(const alias of ['benign prostatic hyperplasia','benign prostate enlargement','enlarged prostate','prostatic hyperplasia','전립선비대증','전립선증식증','bph'])if(consume(alias))bph=true;
 if(!bph&&!procedures.length)return null;
 let areas=regions.filter(([en,ko])=>{const english=consume(en),korean=consume(ko);return english||korean;});
 // A Seoul district/station may be qualified by its parent city, not another region.
 if(areas.length===2&&areas.some(a=>a[2]==='seoul')&&areas.some(a=>['gangnam','jamsil-station','seoul-station'].includes(a[2])))areas=areas.filter(a=>a[2]!=='seoul');
 if(areas.length>1)return null;
 const nearby=/\b(?:near me|nearby|around me)\b/.test(remaining);
 const costs=/\b(?:costs?|prices?)\b|비용/.test(remaining),recovery=/\brecovery\b|회복/.test(remaining);
 for(const token of ['south korea','korea','한국','near me','around me','nearby','treatment','treatments','surgery','surgeries','procedure','procedures','therapy','options','option','clinics','clinic','hospitals','hospital','in','for','near','costs','cost','prices','price','recovery','compare','vs','versus','and','or','치료','수술','시술','비용','회복'])consume(token);
 if(remaining)return null; // Keep clinic names and unknown qualifiers in the existing search.
 const anchor=costs?'costs-and-quotes':recovery?'travel-and-follow-up':procedures.length===1?`procedure-${procedures[0].slug}`:'treatment-options';
 const area=areas[0];
 return {procedures,guideHref:`${bphGuidePath}#${anchor}`,nearby,directoryHref:nearby?'/nearby?department=urology':area?`/clinics/urology/${area[2]}`:'/clinics/urology/all',directoryLabel:nearby?'Find urology clinics near me':area?`Browse urology clinics in ${area[3]}`:'Browse urology clinics in Korea'};
}
