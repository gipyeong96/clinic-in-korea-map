// Place IDs obtained with Google's public Place ID Finder, checked 2026-10-22.
// Identity checked against official branch contact details; no ratings or review text stored.
const places:Record<string,{placeId:string}>={
 'goldman-gangnam':{placeId:'ChIJhc2r2E-hfDURjLkDalcOpKU'},
 'goldman-seoulyeok':{placeId:'ChIJ4dTsm4qifDURH5rHtah--yg'},
 'goldman-incheon':{placeId:'ChIJffomitl7ezURc8v62EO9nKU'},
 'goldman-dongtan':{placeId:'ChIJwStJkeNFezURXvhiklLTKZU'},
 'goldman-jamsil':{placeId:'ChIJb_GGHhylfDURVBg8h7-m-Ts'},
};
export function goldmanGooglePlace(id:string){return Object.prototype.hasOwnProperty.call(places,id)?places[id]:undefined;}
export function googlePlaceUrl(placeId:string,name:string){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${encodeURIComponent(placeId)}`;}
