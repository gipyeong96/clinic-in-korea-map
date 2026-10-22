export const FEEDBACK_EMAIL='shamaim0604@naver.com';
export function feedbackMail(type:string,message:string,clinicUrl:string,clinicName:string=''){
 const topic=type==='correction'?'Incorrect clinic information':'Feature suggestion';
 const body=[`Topic: ${topic}`,clinicName.trim()?`Clinic: ${clinicName.trim().slice(0,200)}`:'',clinicUrl.trim()?`Clinic / page URL: ${clinicUrl.trim().slice(0,1000)}`:'',message.trim().slice(0,3000)].filter(Boolean).join('\n\n');
 return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(`[Korea Clinic Map] ${topic}`)}&body=${encodeURIComponent(body)}`;
}

export function clinicCorrectionLink(clinicId:string){
 return `/feedback?${new URLSearchParams({type:'correction',clinic:clinicId}).toString()}`;
}
