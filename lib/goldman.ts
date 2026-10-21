// Source: official Goldman English branch tabs, checked 2026-10-21.
export const GOLDMAN_ENGLISH_URL='https://www.gold-man.com/ennew/';
export const GOLDMAN_CHECKED='2026-10-21';
export const goldmanBranches=[
 {id:'goldman-gangnam',name:'Gangnam',tab:2,phone:'02-556-7533',address:'12 Seoun-ro, Seocho-gu, Seoul',transit:'Yangjae Station (Line 3), Exit 1; 400 m toward Gangnam Station.',weekday:'Monday–Friday 09:00–18:00',saturday:'09:00–16:00',lunch:'13:00–14:00, including Saturday',stone24:true},
 {id:'goldman-seoulyeok',name:'Seoul Station',tab:3,phone:'02-773-7522',address:'3F, Changhwa Building, 23 Sejong-daero, Jung-gu, Seoul',transit:'Seoul Station (Line 1), Exit 3; 150 m toward Namdaemun.',weekday:'Monday–Friday 09:00–18:00',saturday:'09:00–16:00',lunch:'13:00–14:00, including Saturday',stone24:true},
 {id:'goldman-incheon',name:'Incheon',tab:5,phone:'032-221-1911',address:'15F, Ito Tower, 138 Yesul-ro, Namdong-gu, Incheon',transit:'Arts Center Station (Incheon Line 1), Exit 6; 50 m, across the street.',weekday:'Monday–Friday 09:00–18:00',saturday:'09:00–16:00',lunch:'13:00–14:00, including Saturday',stone24:false},
 {id:'goldman-dongtan',name:'Dongtan',tab:7,phone:'031-373-7532',address:'9F, 489 Dongtan-daero, Hwaseong-si, Gyeonggi-do',transit:'Dongtan Station (SRT / GTX-A), Exit 2; 300 m.',weekday:'Monday, Tuesday, Thursday, Friday 09:00–18:00; closed Wednesdays',saturday:'09:00–15:00 (no lunch break)',lunch:'13:00–14:00 on weekdays',stone24:false},
 {id:'goldman-jamsil',name:'Jamsil',tab:6,phone:'02-421-7511',address:'3F, Korea Advertising Culture Center, 137 Olympic-ro 35-gil, Songpa-gu, Seoul',transit:'Jamsil Station (Lines 2 and 8), Exit 7.',weekday:'Monday–Friday 09:00–18:00',saturday:'09:00–16:00',lunch:'13:00–14:00, including Saturday',stone24:true},
];
export function goldmanBranch(id:string){return goldmanBranches.find(branch=>branch.id===id);}
export function goldmanLocationUrl(tab:number){return `${GOLDMAN_ENGLISH_URL}support/location?tab=${tab}`;}

// Additional homepage profiles reuse the verified branch directory; no estimated coordinates.
export const additionalGoldmanClinics=goldmanBranches.filter(b=>['goldman-dongtan','goldman-jamsil'].includes(b.id)).map(branch=>({
 id:branch.id,name_en:`Goldman Urology Clinic ${branch.name}`,
 name_ko:branch.id==='goldman-dongtan'?'골드만비뇨의학과의원 동탄점':'골드만비뇨의학과의원 잠실점',
 telephone:branch.phone,address_en:branch.address,
 address_ko:branch.id==='goldman-dongtan'?'경기 화성시 동탄대로 489, 9층':'서울 송파구 올림픽로35길 137, 3층',
 category:{slug:'urology',name_en:'Urology'},categories:{slug:'urology',name_en:'Urology'},
 is_premium:true,premium_data:{website:GOLDMAN_ENGLISH_URL,slogan_en:branch.transit},
}));
export function additionalGoldmanClinic(id:string){return additionalGoldmanClinics.find(clinic=>clinic.id===id);}
