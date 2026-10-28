export async function requestNearby(body:unknown,signal:AbortSignal,timeoutMs=20000){
 const controller=new AbortController();let timedOut=false;
 const cancel=()=>controller.abort();signal.addEventListener('abort',cancel,{once:true});
 if(signal.aborted)cancel();
 const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeoutMs);
 try{
  const response=await fetch('/api/nearby',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify(body),signal:controller.signal});
  const result=await response.json();
  if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
  if(!response.ok||!Array.isArray(result.clinics)||typeof result.hasNext!=='boolean')throw new Error('Nearby data unavailable');
  return result;
 }catch(error){if(timedOut)throw new Error('Nearby search timed out');throw error;}
 finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
}
