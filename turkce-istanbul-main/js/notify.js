/* ===== streak reminders (Web Push) – works when the app is closed; server side in push.js ===== */
Object.assign(UI.en,{ntTitle:'Streak reminders',ntOn:'On for this device. We will remind you in the evening if your streak is at risk.',ntOff:'Get a notification in the evening if your streak is about to end.',
 ntTurnOn:'Turn on reminders',ntTurnOff:'Turn off',ntTest:'Send a test',ntTestSent:'Test sent',ntNoDevice:'No device received it. Turn reminders off and on again.',
 ntBlocked:'Notifications are blocked for this site in your browser settings.',ntInsecure:'Notifications only work on the https:// address.',ntNone:'This browser cannot show notifications.',
 ntIos:'On iPhone/iPad: tap Share → Add to Home Screen, then open the app from there.',ntErr:'Could not turn on reminders. Try again.',
 leaveT:'Wait, don\'t go!',leaveQ:'If you leave now, your progress in this lesson will be lost.',quit:'Quit'});
Object.assign(UI.ar,{ntTitle:'تذكيرات السلسلة',ntOn:'مفعّلة على هذا الجهاز. سنذكّرك مساءً إذا كانت سلسلتك في خطر.',ntOff:'احصل على إشعار مساءً إذا كانت سلسلتك على وشك الانتهاء.',
 ntTurnOn:'تفعيل التذكيرات',ntTurnOff:'إيقاف',ntTest:'إرسال إشعار تجريبي',ntTestSent:'تم الإرسال',ntNoDevice:'لم يصل إلى أي جهاز. أوقف التذكيرات ثم فعّلها من جديد.',
 ntBlocked:'الإشعارات محظورة لهذا الموقع في إعدادات المتصفح.',ntInsecure:'الإشعارات تعمل فقط على عنوان https://.',ntNone:'هذا المتصفح لا يدعم الإشعارات.',
 ntIos:'على iPhone/iPad: اضغط مشاركة ← إضافة إلى الشاشة الرئيسية ثم افتح التطبيق منها.',ntErr:'تعذّر تفعيل التذكيرات. حاول مجدداً.',
 leaveT:'لحظة، لا تذهب!',leaveQ:'إذا غادرت الآن، سيضيع تقدمك في هذا الدرس.',quit:'خروج'});

const k2u=k=>{const p='='.repeat((4-k.length%4)%4),r=atob((k+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(r,c=>c.charCodeAt(0))};
async function pushReg(){try{return await navigator.serviceWorker.getRegistration()||await navigator.serviceWorker.ready}catch(e){return null}}
async function pushState(){if(!window.isSecureContext)return'insecure';if(!('serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window))return/iPad|iPhone/.test(navigator.userAgent)?'ios':'none';
 if(Notification.permission=='denied')return'blocked';const r=await pushReg();if(!r)return'none';return await r.pushManager.getSubscription()?'on':'off'}
async function pushOn(){const perm=await Notification.requestPermission();if(perm!='granted')return false;
 const r=await pushReg(),k=await api('GET','/api/push/key');if(!r||!k.ok)return false;
 const sub=await r.pushManager.getSubscription()||await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:k2u(k.j.key)});
 const res=await api('POST','/api/push/subscribe',{subscription:sub.toJSON(),tz:Intl.DateTimeFormat().resolvedOptions().timeZone});return res.ok}
async function pushOff(){try{const r=await pushReg(),sub=r&&await r.pushManager.getSubscription();if(sub){await api('POST','/api/push/unsubscribe',{endpoint:sub.endpoint});await sub.unsubscribe()}}catch(e){}}

async function notifyUi(){const h=$('#ntf');if(!h)return;const st=await pushState();if(!$('#ntf'))return;
 const msg={insecure:'ntInsecure',none:'ntNone',ios:'ntIos',blocked:'ntBlocked'}[st];
 h.innerHTML=`<h3>🔔 ${T('ntTitle')}</h3><p class="mut">${msg?T(msg):T(st=='on'?'ntOn':'ntOff')}</p>`+(msg?'':st=='on'?`<label class="rt">⏰ ${T('remAt')} <input type="time" id="nt-r" value="${hhmm(S.rem==null?1200:S.rem)}"></label><button class="btn alt" id="nt-t">${T('ntTest')}</button><button class="btn alt" id="nt-x">${T('ntTurnOff')}</button>`:`<button class="btn" id="nt-o">${T('ntTurnOn')}</button>`);
 if($('#nt-o'))$('#nt-o').onclick=async()=>{$('#nt-o').classList.add('dis');const ok=await pushOn();await notifyUi();if(!ok&&(await pushState())!='blocked'&&$('#ntf'))$('#ntf').insertAdjacentHTML('beforeend',`<p class="err">${T('ntErr')}</p>`)};
 if($('#nt-r'))$('#nt-r').onchange=()=>{const v=$('#nt-r').value.split(':').map(Number);if(v.length==2&&Number.isFinite(v[0])&&Number.isFinite(v[1])){S.rem=v[0]*60+v[1];save()}};
 if($('#nt-x'))$('#nt-x').onclick=async()=>{await pushOff();notifyUi()};
 if($('#nt-t'))$('#nt-t').onclick=async()=>{const r=await api('POST','/api/push/test',{});const t=$('#nt-t');if(t)t.textContent=r.ok&&r.j.sent?'✅ '+T('ntTestSent'):'⚠️ '+T('ntNoDevice')}}
