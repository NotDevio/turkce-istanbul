/* auth + sync client. Two modes:
   - "server": node server.js is running (accounts, cross-device sync via /api/*)
   - "local" : static hosting (GitHub Pages) -> profile is kept in this browser's localStorage */
let MODE='local',REV=0,EPOCH=0,USER='',syncT=null,syncAt=0,syncErr=false;
const LKEY='tri_local_state';
async function api(method,url,body){
 try{const r=await fetch(url,{method,credentials:'same-origin',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
  let j=null;try{j=await r.json()}catch(e){}
  return{ok:r.ok,status:r.status,j:j||{}}}catch(e){return{ok:false,status:0,j:{}}}}
const AT={
 ar:{t:'مرحباً! 👋',user:'اسم المستخدم',pass:'كلمة المرور',name:'اسمك',in:'تسجيل الدخول',up:'إنشاء حساب',go:'ابدأ',sw1:'لا تملك حساباً؟ أنشئ واحداً',sw2:'لديك حساب؟ سجّل الدخول',bad:'بيانات غير صحيحة',taken:'الاسم مستخدم',short:'كلمة المرور 6 أحرف على الأقل',bu:'الاسم: 3-20 حرفاً/رقماً',old:'كلمة المرور الحالية',nw:'كلمة المرور الجديدة',ok:'تم',cancel:'إلغاء',synced:'✓ تم الحفظ',local:'يُحفظ على هذا الجهاز',off:'⚠ لا اتصال بالخادم'},
 en:{t:'Welcome! 👋',user:'Username',pass:'Password',name:'Your name',in:'Log in',up:'Create account',go:'Start',sw1:'No account? Create one',sw2:'Have an account? Log in',bad:'Wrong username or password',taken:'Username taken',short:'Password needs 6+ characters',bu:'Username: 3-20 letters/digits',old:'Current password',nw:'New password',ok:'Done',cancel:'Cancel',synced:'✓ Saved',local:'Saved on this device',off:'⚠ Server unreachable'}};
const A=()=>AT[LC()]||AT.en;
function adopt(st,u){S=st;S.lang=S.lang||FL||'ar';if(u)S.name=u;FL=null;try{resetTrack(true)}catch(e){}ensure();applyLang()}
function enter(){document.querySelectorAll('.modal.auth').forEach(m=>m.remove());S.tab=S.tab||'learn';applyLang();home()}
function modal(html){document.querySelectorAll('.modal.auth').forEach(m=>m.remove());const m=document.createElement('div');m.className='modal auth';m.innerHTML=`<div class="mc">${html}</div>`;document.body.appendChild(m);return m}
function langBtns(re){return`<div class="langs">${Object.keys(LANGS).map(k=>`<button class="opt ${k==LC()?'sel':''}" data-fl="${k}">${LANGS[k].n}</button>`).join('')}</div>`}
function bindLang(re){document.querySelectorAll('.modal.auth [data-fl]').forEach(b=>b.onclick=()=>{FL=b.dataset.fl;applyLang();re()})}
function loginScreen(reg){
 const a=A();
 if(MODE=='local')return localScreen();
 const m=modal(`${langBtns()}<h2>${a.t}</h2><input id="au" placeholder="${a.user}" autocomplete="username" autocapitalize="off"><div style="height:10px"></div><input id="ap" type="password" placeholder="${a.pass}" autocomplete="${reg?'new-password':'current-password'}"><p class="mut center" id="ae" style="color:var(--r);min-height:1.4em"></p><button class="btn" id="ag">${reg?a.up:a.in}</button><button class="btn alt" id="as">${reg?a.sw2:a.sw1}</button>`);
 bindLang(()=>loginScreen(reg));
 $('#as').onclick=()=>loginScreen(!reg);
 const go=async()=>{const u=$('#au').value.trim(),p=$('#ap').value,e=$('#ae');e.textContent='';
  if(reg){if(!/^[A-Za-z0-9_.-]{3,20}$/.test(u))return e.textContent=a.bu;if(p.length<6)return e.textContent=a.short}
  const body={username:u,password:p};if(reg){const s=mk(u,AVS[Math.random()*AVS.length|0],LC());body.state=s}
  const r=await api('POST',reg?'/api/register':'/api/login',body);
  if(!r.ok)return e.textContent=r.status==409?a.taken:r.status==400?(r.j.error=='bad_password'?a.short:a.bu):a.bad;
  MODE='server';USER=r.j.username;REV=r.j.rev;EPOCH=r.j.epoch;adopt(r.j.state,USER);enter()};
 $('#ag').onclick=go;m.querySelectorAll('input').forEach(i=>i.onkeydown=e=>{if(e.key=='Enter')go()});
}
function localScreen(){
 const a=A();let av=AVS[0];
 const m=modal(`${langBtns()}<h2>${a.t}</h2><input id="an" placeholder="${a.name}" maxlength="20" autocomplete="off"><div class="langs" style="flex-wrap:wrap;margin:12px 0">${AVS.map(x=>`<button class="opt ${x==av?'sel':''}" data-av="${x}">${x}</button>`).join('')}</div><button class="btn" id="ag">${a.go}</button><p class="mut center">${a.local}</p>`);
 bindLang(localScreen);
 m.querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{av=b.dataset.av;m.querySelectorAll('[data-av]').forEach(x=>x.classList.toggle('sel',x==b))});
 const go=()=>{const n=$('#an').value.trim()||'Player';adopt(mk(n,av,LC()));persistLocal();enter()};
 $('#ag').onclick=go;$('#an').onkeydown=e=>{if(e.key=='Enter')go()};setTimeout(()=>$('#an').focus(),60);
}
function persistLocal(){try{localStorage.setItem(LKEY,JSON.stringify(S))}catch(e){}}
function queueSync(reset){
 if(!S)return;
 if(MODE=='local'){persistLocal();return}
 clearTimeout(syncT);syncT=setTimeout(()=>sync(reset),reset?0:800)}
async function sync(reset){
 if(!S||MODE!='server')return;clearTimeout(syncT);
 const r=await api('PUT','/api/progress',{state:S,baseRev:REV,baseEpoch:EPOCH,reset:reset===true});
 if(!r.ok){syncErr=true;if(r.status==401){S=null;loginScreen(false)}paintSync();return}
 syncErr=false;syncAt=Date.now();REV=r.j.rev;EPOCH=r.j.epoch;
 if(r.j.merged||r.j.adopted){const keep=S.tab,lang=S.lang;Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,r.j.state,{tab:keep});S.name=USER||S.name;ensure();if(!document.body.classList.contains('focus'))home()}
 paintSync()}
function syncText(){const a=A();return MODE=='local'?a.local:syncErr?a.off:(syncAt?a.synced:'')}
function paintSync(){const e=$('#sync');if(e)e.textContent=syncText()}
async function logout(){
 if(MODE=='server'){try{await sync()}catch(e){}await api('POST','/api/logout')}
 else{try{localStorage.removeItem(LKEY)}catch(e){}}
 S=null;REV=EPOCH=0;document.body.classList.remove('focus');$('#app').innerHTML='';$('#nav').innerHTML='';loginScreen(false)}
function pwModal(){
 const a=A();
 if(MODE=='local')return toast(a.local);
 const m=modal(`<input id="po" type="password" placeholder="${a.old}" autocomplete="current-password"><div style="height:10px"></div><input id="pn" type="password" placeholder="${a.nw}" autocomplete="new-password"><p class="mut center" id="pe" style="color:var(--r);min-height:1.4em"></p><button class="btn" id="pg">${a.ok}</button><button class="btn alt" id="pc">${a.cancel}</button>`);
 $('#pc').onclick=()=>m.remove();
 $('#pg').onclick=async()=>{const n=$('#pn').value;if(n.length<6)return $('#pe').textContent=a.short;
  const r=await api('POST','/api/password',{oldPassword:$('#po').value,newPassword:n});
  if(r.ok){m.remove();toast(a.ok)}else $('#pe').textContent=a.bad}}
async function boot(){
 const r=await api('GET','/api/me');
 if(r.ok&&r.j.state){MODE='server';USER=r.j.username;REV=r.j.rev;EPOCH=r.j.epoch;adopt(r.j.state,USER);return enter()}
 if(r.status==401&&r.j.error){MODE='server';return loginScreen(false)}   // real server, not logged in
 MODE='local';                                                          // static host: no /api
 let st=null;try{st=JSON.parse(localStorage.getItem(LKEY))}catch(e){}
 if(st&&st.name){adopt(st);return enter()}
 localScreen()}
addEventListener('pagehide',()=>{if(S){MODE=='local'?persistLocal():0}});
