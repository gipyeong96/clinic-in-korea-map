export const conditionSource='https://www.data.go.kr/data/3039508/openapi.do';
export const conditionEnglish:Record<string,string>={'방광염':'Cystitis','성매개감염병':'Sexually transmitted infections','신경인성 방광':'Neurogenic bladder','요로결석증':'Urinary stones','전립선증식증':'Prostatic hyperplasia (BPH)','만성질환':'Chronic conditions'};
export type ConditionRecord={ykiho:string;clinicName:string;referenceMonth:string;checkedAt:string;conditions:string[];verified:boolean};
export function conditionRecord(value:unknown,ykiho:string):ConditionRecord|null{
 if(!value||typeof value!=='object')return null;
 const r=value as ConditionRecord;
 if(r.verified!==true||!ykiho||r.ykiho!==ykiho||typeof r.clinicName!=='string'||!r.clinicName.trim())return null;
 if(!/^20\d{2}(0[1-9]|1[0-2])$/.test(r.referenceMonth)||!/^20\d{2}-\d{2}-\d{2}$/.test(r.checkedAt))return null;
 const checked=new Date(`${r.checkedAt}T00:00:00Z`);
 if(!Number.isFinite(checked.getTime())||checked.toISOString().slice(0,10)!==r.checkedAt||r.referenceMonth>r.checkedAt.slice(0,7).replace('-',''))return null;
 if(!Array.isArray(r.conditions)||r.conditions.length>5||r.conditions.some(c=>typeof c!=='string'||!c.trim()||c.length>130))return null;
 if(!r.conditions.length)return null;
 return {...r,conditions:Array.from(new Set(r.conditions.map(c=>c.trim())))};
}
export function referenceLabel(month:string){return new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${month.slice(0,4)}-${month.slice(4,6)}-01T00:00:00Z`));}
