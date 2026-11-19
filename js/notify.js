/* push reminders: only available when the node server is running (needs /api/push/*) */
async function notifyUi(){
 const h=document.querySelector('#ntf');if(!h)return;
 if(typeof MODE==='undefined'||MODE!=='server'||!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){h.textContent='';return}
 const ar=(typeof LC==='function'?LC():'en')=='ar';
 let reg=null,sub=null;try{reg=await navigator.serviceWorker.ready;sub=await reg.pushManager.getSubscription()}catch(e){return}
 h.innerHTML=`<button class="btn alt" id="nt">🔔 ${sub?(ar?'إيقاف التذكيرات':'Turn reminders off'):(ar?'تفعيل التذكيرات':'Turn reminders on')}</button>`;
 document.querySelector('#nt').onclick=async()=>{
  try{
   if(sub){await api('POST','/api/push/unsubscribe',{endpoint:sub.endpoint});await sub.unsubscribe()}
   else{
    if(await Notification.requestPermission()!=='granted')return toast(ar?'الإشعارات محظورة':'Notifications blocked');
    const k=await api('GET','/api/push/key');if(!k.ok)return;
    const pad='='.repeat((4-k.j.key.length%4)%4),raw=atob((k.j.key+pad).replace(/-/g,'+').replace(/_/g,'/')),u8=Uint8Array.from(raw,c=>c.charCodeAt(0));
    const s=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8});
    await api('POST','/api/push/subscribe',{subscription:s.toJSON(),tz:Intl.DateTimeFormat().resolvedOptions().timeZone});
   }
  }catch(e){toast(String(e.message||e))}
  notifyUi()}}
