/* ===== login + cross-device sync (talks to server.js) =====
   The server is the source of truth. The browser keeps a copy in localStorage (tri_session)
   so the app opens instantly and keeps working offline; changes are pushed a moment after each save. */
Object.assign(UI.en,{
 login:'Log in',register:'Sign up',username:'Username',password:'Password',newPw:'New password',oldPw:'Current password',
 hintUser:'3–20 letters, numbers or _',importLbl:'Import progress saved on this device',importNone:'Start fresh',
 e_bad_credentials:'Wrong username or password',e_taken:'That username is taken',e_bad_username:'Username: 3–20 letters, numbers or _',
 e_bad_password:'Password must be at least 6 characters',e_rate_limited:'Too many attempts. Try again in a few minutes.',
 e_register_closed:'Sign-ups are closed on this server',e_net:'Cannot reach the server',e_unauthorized:'Your session expired. Please log in again.',
 e_server_error:'Server error. Try again.',
 logout:'Log out',logoutQ:'Some progress has not been uploaded yet. Log out anyway?',changePw:'Change password',pwDone:'Password changed. Other devices were signed out.',
 synced:'Progress saved on the server',syncing:'Saving…',offline:'Offline – progress will upload when the server is reachable',signedAs:'Signed in as'});
Object.assign(UI.ar,{
 login:'تسجيل الدخول',register:'إنشاء حساب',username:'اسم المستخدم',password:'كلمة المرور',newPw:'كلمة المرور الجديدة',oldPw:'كلمة المرور الحالية',
 hintUser:'٣–٢٠ حرفاً إنجليزياً أو رقماً أو _',importLbl:'استيراد التقدم المحفوظ على هذا الجهاز',importNone:'ابدأ من جديد',
 e_bad_credentials:'اسم المستخدم أو كلمة المرور غير صحيحة',e_taken:'اسم المستخدم مستخدم بالفعل',e_bad_username:'اسم المستخدم: ٣–٢٠ حرفاً إنجليزياً أو رقماً أو _',
 e_bad_password:'كلمة المرور يجب أن تكون ٦ أحرف على الأقل',e_rate_limited:'محاولات كثيرة. حاول بعد بضع دقائق.',
 e_register_closed:'التسجيل مغلق على هذا الخادم',e_net:'تعذّر الاتصال بالخادم',e_unauthorized:'انتهت الجلسة. سجّل الدخول من جديد.',
 e_server_error:'خطأ في الخادم. حاول مجدداً.',
 logout:'تسجيل الخروج',logoutQ:'بعض التقدم لم يُرفع بعد. هل تريد تسجيل الخروج؟',changePw:'تغيير كلمة المرور',pwDone:'تم تغيير كلمة المرور. تم تسجيل الخروج من الأجهزة الأخرى.',
 synced:'تم حفظ التقدم على الخادم',syncing:'جارٍ الحفظ…',offline:'بدون اتصال – سيُرفع التقدم عند توفر الخادم',signedAs:'مسجّل باسم'});

const CK='tri_session';
let USER=null,REV=0,EP=0,DIRTY=false,RESET=false,SYNCING=false,ONLINE=true,STIMER=0;

const api=async(m,u,b,ka)=>{try{const r=await fetch(u,{method:m,headers:m=='GET'?{}:{'content-type':'application/json'},body:m=='GET'?undefined:JSON.stringify(b||{}),credentials:'same-origin',keepalive:!!ka});
 let j={};try{j=await r.json()}catch(e){}return{ok:r.ok,status:r.status,j}}catch(e){return{ok:false,status:0,j:{}}}};
const errT=r=>T('e_'+(r.status?r.j.error||'server_error':'net'));
const cacheSave=()=>{try{USER?localStorage.setItem(CK,JSON.stringify({u:USER,rev:REV,ep:EP,dirty:DIRTY,reset:RESET,state:S})):localStorage.removeItem(CK)}catch(e){}};
const syncText=()=>SYNCING||DIRTY?(ONLINE?'⏳ '+T('syncing'):'⚠️ '+T('offline')):'✅ '+T('synced');
const syncUi=()=>{const e=$('#sync');if(e)e.textContent=syncText()};
function adopt(st){Object.assign(S,st);S.name=USER;if(typeof resetTrack=='function')resetTrack()}
function refreshView(){if(!S)return;head();if(!document.body.classList.contains('focus')&&!$('.modal'))home()}

/* called by save() in app.js after every change */
function queueSync(reset){if(!USER||!S)return;DIRTY=true;if(reset)RESET=true;cacheSave();clearTimeout(STIMER);STIMER=setTimeout(()=>sync(),1200);syncUi()}

async function sync(ka){clearTimeout(STIMER);if(!USER||!S||SYNCING||!DIRTY)return;
 SYNCING=true;DIRTY=false;const reset=RESET;RESET=false;syncUi();
 const r=await api('PUT','/api/progress',{state:S,baseRev:REV,baseEpoch:EP,reset},ka);
 SYNCING=false;
 if(r.ok){ONLINE=true;REV=r.j.rev;EP=r.j.epoch;
  if(r.j.adopted||(r.j.merged&&!DIRTY)){adopt(r.j.state);refreshView()}
  if(DIRTY)STIMER=setTimeout(()=>sync(),300)}
 else{DIRTY=true;if(reset)RESET=true;
  if(r.status==401){cacheSave();return needLogin(T('e_unauthorized'))}
  ONLINE=false;STIMER=setTimeout(()=>sync(),10000)}
 cacheSave();syncUi()}

async function pull(){if(!USER||SYNCING||document.hidden)return;if(DIRTY)return sync();
 const r=await api('GET','/api/me');if(r.status==401)return needLogin(T('e_unauthorized'));
 if(!r.ok){ONLINE=false;return syncUi()}ONLINE=true;
 if(!DIRTY&&!SYNCING&&(r.j.rev!==REV||r.j.epoch!==EP)){REV=r.j.rev;EP=r.j.epoch;adopt(r.j.state);cacheSave();refreshView()}syncUi()}

document.addEventListener('visibilitychange',()=>{document.hidden?sync(true):pull()});
addEventListener('pagehide',()=>sync(true));addEventListener('online',()=>{if(USER)pull()});
setInterval(pull,60000);

function startSession(j,keepLocal){if(typeof resetTrack=='function')resetTrack(true);USER=j.username;REV=j.rev;EP=j.epoch;
 if(keepLocal){RESET=!!keepLocal.reset;S=keepLocal.state;S.name=USER;REV=keepLocal.rev;EP=keepLocal.ep;DIRTY=true}
 else{S=j.state;S.name=USER;DIRTY=false;RESET=false}
 ONLINE=true;cacheSave();if(DIRTY)sync()}

function needLogin(msg){authModal(msg)}

/* progress that was saved in this browser before logins existed (old local profiles / very old `tri` key) */
function localProfiles(){const out=[],acc=jget('tri_accounts',null),act=localStorage.getItem('tri_active_user');
 if(acc&&typeof acc=='object')Object.values(acc).forEach(a=>{if(a&&(a.xp||Object.keys(a.prog||{}).length||Object.keys(a.w||{}).length))out.push(a)});
 const o=jget('tri',null);if(!out.length&&o){const a=legacy(o);if(a.xp||Object.keys(a.prog).length)out.push(a)}
 out.sort((a,b)=>(b.id==act)-(a.id==act));return out}

/* ===== login / sign-up screen (cannot be dismissed) ===== */
function authModal(msg){if($('.modal.auth'))return;document.querySelectorAll('.modal').forEach(x=>x.remove());
 const m=document.createElement('div');m.className='modal auth';document.body.appendChild(m);
 const locals=localProfiles();let first=true,mode='login',un='',pw='',av=AVS[0],lg=jget('tri_ui_lang','ar'),imp=locals.length?0:-1,err=msg||'',busy=false;if(!LANGS[lg])lg='ar';
 const draw=()=>{FL=lg;applyLang();const reg=mode=='register';
  m.innerHTML=`<div class="mc" ${first?'':'style="animation:none"'}><div class="langs">${Object.keys(LANGS).map(k=>`<button type="button" class="opt ${k==lg?'sel':''}" data-lg="${k}">${LANGS[k].n}</button>`).join('')}</div>
  <div class="langs"><button type="button" class="opt ${reg?'':'sel'}" data-md="login">${T('login')}</button><button type="button" class="opt ${reg?'sel':''}" data-md="register">${T('register')}</button></div>
  <form id="af" novalidate><input id="un" dir="ltr" maxlength="20" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="${T('username')}" value="${esc(un)}">
  ${reg?`<p class="mut">${T('hintUser')}</p>`:''}
  <input id="pw" type="password" dir="ltr" maxlength="200" autocomplete="${reg?'new-password':'current-password'}" placeholder="${T('password')}" value="${esc(pw)}" style="margin-top:10px">
  ${reg?`<p class="mut">${T('pickAv')}</p><div class="avs">${AVS.map(e=>`<button type="button" class="${e==av?'sel':''}" data-av="${e}">${e}</button>`).join('')}</div>
  ${locals.length?`<p class="mut">${T('importLbl')}</p><select id="imp"><option value="-1">${T('importNone')}</option>${locals.map((a,i)=>`<option value="${i}" ${i==imp?'selected':''}>${esc(a.av||'')} ${esc(a.name||'')} · ⭐ ${a.xp||0}</option>`).join('')}</select>`:''}`:''}
  <p class="err" role="alert">${esc(err)}</p><button class="btn ${busy?'dis':''}" type="submit">${reg?T('create'):T('login')}</button></form>${typeof dlBtn=='function'?dlBtn():''}</div>`;
  const q=s=>m.querySelector(s);
  m.querySelectorAll('[data-lg]').forEach(b=>b.onclick=()=>{lg=b.dataset.lg;try{localStorage.setItem('tri_ui_lang',lg)}catch(e){}err='';draw()});
  m.querySelectorAll('[data-md]').forEach(b=>b.onclick=()=>{mode=b.dataset.md;err='';draw()});
  m.querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{av=b.dataset.av;draw()});
  q('#un').oninput=e=>un=e.target.value;q('#pw').oninput=e=>pw=e.target.value;if(q('#imp'))q('#imp').onchange=e=>imp=+e.target.value;
  q('#af').onsubmit=async e=>{e.preventDefault();if(busy)return;un=un.trim();err='';
   if(!/^[A-Za-z0-9_]{3,20}$/.test(un))err=mode=='register'?T('e_bad_username'):T('e_bad_credentials');
   else if(!pw||(mode=='register'&&pw.length<6))err=mode=='register'?T('e_bad_password'):T('e_bad_credentials');
   if(err)return draw();
   busy=true;draw();
   let body={username:un,password:pw};
   if(mode=='register'){const base=imp>=0?locals[imp]:{av,lang:lg};body.state={...base,av:imp>=0?base.av:av,lang:imp>=0?base.lang:lg}}
   const r=await api('POST','/api/'+mode,body);busy=false;
   if(!r.ok){err=errT(r);pw='';return draw()}
   try{localStorage.setItem('tri_ui_lang',lg)}catch(e){}
   const c=jget(CK,null),mine=c&&c.dirty&&String(c.u).toLowerCase()==un.toLowerCase();   // unsent progress from an expired session
   startSession(r.j,mine?c:null);m.remove();FL=null;applyLang();home()};
  const f=q(un&&!pw?'#pw':'#un');f&&setTimeout(()=>f.focus(),30);first=false};
 draw()}

/* ===== change password ===== */
function pwModal(){const m=document.createElement('div');m.className='modal';document.body.appendChild(m);
 let first=true,a='',b='',err='',ok=false;m.onclick=e=>{if(e.target==m)m.remove()};
 const draw=()=>{m.innerHTML=`<div class="mc" ${first?'':'style="animation:none"'}><h2>${T('changePw')}</h2><form id="pf" novalidate>
  <input id="p1" type="password" dir="ltr" autocomplete="current-password" placeholder="${T('oldPw')}" value="${esc(a)}"><input id="p2" type="password" dir="ltr" autocomplete="new-password" placeholder="${T('newPw')}" value="${esc(b)}" style="margin-top:10px">
  <p class="${ok?'mut':'err'}" role="alert">${esc(ok?T('pwDone'):err)}</p><button class="btn" type="submit">${T('create')}</button><button class="btn alt" type="button" id="x">${T('cancel')}</button></form></div>`;
  first=false;$('#x').onclick=()=>m.remove();$('#p1').oninput=e=>a=e.target.value;$('#p2').oninput=e=>b=e.target.value;
  $('#pf').onsubmit=async e=>{e.preventDefault();ok=false;err='';if(b.length<6){err=T('e_bad_password');return draw()}
   const r=await api('POST','/api/password',{oldPassword:a,newPassword:b});if(!r.ok){err=errT(r);return draw()}ok=true;a=b='';draw()}};
 draw()}

async function logout(){if(DIRTY||SYNCING){await sync();if(DIRTY&&!confirm(T('logoutQ')))return}
 await pushOff();await api('POST','/api/logout');USER=null;S=null;DIRTY=RESET=false;clearTimeout(STIMER);cacheSave();
 $('#nav').innerHTML='';app.innerHTML='';$('#acc').innerHTML='';$('#xp').textContent='0';$('#streak').textContent='0';document.body.classList.remove('focus');authModal()}

/* ===== boot: show cached progress immediately, then confirm with the server ===== */
async function boot(){
 const c=jget(CK,null);
 if(c&&c.state&&c.u){USER=c.u;REV=c.rev;EP=c.ep;DIRTY=!!c.dirty;RESET=!!c.reset;S=c.state;S.name=USER;applyLang();home()}
 const r=await api('GET','/api/me');
 if(r.ok){ONLINE=true;
  if(!USER||USER.toLowerCase()!=r.j.username.toLowerCase()){startSession(r.j);applyLang();return home()}
  USER=r.j.username;
  if(DIRTY)sync();else if(r.j.rev!==REV||r.j.epoch!==EP){REV=r.j.rev;EP=r.j.epoch;adopt(r.j.state);cacheSave();applyLang();refreshView()}}
 else if(r.status==401){if(!DIRTY){USER=null;S=null;cacheSave();app.innerHTML='';$('#nav').innerHTML=''}authModal(S?T('e_unauthorized'):'')}
 else{ONLINE=false;if(!S)authModal(T('e_net'))}}
