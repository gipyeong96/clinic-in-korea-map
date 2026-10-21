export const FEEDBACK_EMAIL='shamaim0604@naver.com';
export function feedbackMail(type:string,message:string,clinicUrl:string){
 const topic=type==='correction'?'Incorrect clinic information':'Feature suggestion';
 const body=[`Topic: ${topic}`,clinicUrl.trim()?`Clinic / page URL: ${clinicUrl.trim().slice(0,1000)}`:'',message.trim().slice(0,3000)].filter(Boolean).join('\n\n');
 return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(`[Korea Clinic Map] ${topic}`)}&body=${encodeURIComponent(body)}`;
}
