export const stationRegions = [
  {slug:'capital-region',name:'Seoul · Incheon · Gyeonggi',cities:['Seoul','Gyeonggi','Seoul · Incheon · Gyeonggi']},
  {slug:'busan-ulsan-gimhae',name:'Busan · Ulsan · Gimhae',cities:['Busan','Ulsan','Busan · Ulsan · Gimhae']},
  ...['Daegu','Daejeon','Gwangju','Gangwon','Chungbuk','Chungnam','Gyeongbuk','Gyeongnam','Jeonbuk','Jeonnam'].map(name=>({slug:name.toLowerCase(),name,cities:[name]})),
];
