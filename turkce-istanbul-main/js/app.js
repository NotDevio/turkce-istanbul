const $=s=>document.querySelector(s),app=$('#app');
/* ===== learner state S: loaded from the server after login (see js/auth.js); FL = forced UI language on the login screen ===== */
const jget=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
let S=null,FL=null;
const AVS=['🦊','🐼','🦁','🐯','🐸','🐙','🦄','🐧','🐱','🐶','🦉','🐢'];
const uid=()=>'u'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const mk=(name,av,lang)=>({id:uid(),name,av,lang,xp:0,streak:0,last:'',prog:{},miss:{},exams:{},w:{},tab:'learn'});
const save=reset=>{try{track()}catch(e){}queueSync(reset===true)};
const LC=()=>FL||(S&&S.lang)||'ar';
const T=(k,...a)=>{const l=LC(),v=UI[l]&&UI[l][k]!==undefined?UI[l][k]:UI.en[k]!==undefined?UI.en[k]:k;return typeof v=='function'?v(...a):v};
function applyLang(){const d=document.documentElement,l=LC();d.lang=l;d.dir=LANGS[l].dir;document.title=T('appTitle')}
function legacy(o){const a=mk('Player','🦊','ar');
 a.xp=o.xp||0;a.streak=o.streak||0;a.last=o.last||'';a.exams=o.exams||{};
 Object.keys(o.miss||{}).forEach(k=>{if(byTr(k))a.miss[k]=1});
 Object.keys(o.done||{}).forEach(id=>{const u=UNITS.find(x=>x.id==id);if(u){a.prog[id]=5;u.items.forEach(p=>a.w[p[0]]=6)}});return a}

/* ===== utils ===== */
const shuf=a=>[...a].sort(()=>Math.random()-.5);
const norm=s=>String(s).toLocaleLowerCase('tr').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/[.,!?'’؟،]/g,'').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/\s+/g,' ').trim();
const bindSay=el=>el.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>speak(b.dataset.say));
let AC;const sfx=ok=>{try{AC=AC||new(window.AudioContext||webkitAudioContext)();AC.resume&&AC.resume();const t=AC.currentTime;
 const tone=(f,st,d,ty,v)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f,t+st);g.gain.setValueAtTime(.0001,t+st);g.gain.linearRampToValueAtTime(v,t+st+.01);g.gain.exponentialRampToValueAtTime(.001,t+st+d);o.connect(g);g.connect(AC.destination);o.start(t+st);o.stop(t+st+d)};
 if(ok){tone(784,0,.2,'triangle',.22);tone(1047,.1,.35,'triangle',.22);tone(1319,.1,.35,'sine',.07)}else{tone(196,0,.2,'sawtooth',.11);tone(147,.14,.4,'sawtooth',.11)}}catch(e){}};
function confetti(){const c=document.createElement('div');c.className='conf';c.innerHTML=Array.from({length:60},()=>`<i style="left:${Math.random()*100}%;background:${['#58cc02','#1cb0f6','#ffc800','#ff4b4b','#ce82ff'][Math.random()*5|0]};animation-delay:${Math.random()*.6}s;animation-duration:${1.6+Math.random()*1.4}s"></i>`).join('');document.body.appendChild(c);setTimeout(()=>c.remove(),3500)}
const dstr=o=>{const d=new Date();d.setDate(d.getDate()+(o||0));return d.toDateString()};
const curStreak=()=>S.last==dstr(0)||S.last==dstr(-1)||(S.last==dstr(-2)&&S.fz>0)?S.streak:0;   // a day is midnight to midnight: miss one whole day and it is over
function head(){ensure();$('#xp').textContent=bal();$('#streak').textContent=curStreak();const fl=document.querySelector('.fl');if(fl)fl.classList.toggle('off',S.last!=dstr(0));const a=$('#acc');a.innerHTML=`<span class="av">${S.av}</span><small>${esc(S.name)}</small>`;a.onclick=()=>{S.tab='me';save();home()}}
function setBack(fn){const b=$('#back');b.textContent=rtl()?'→':'←';b.setAttribute('aria-label',T('back'));b.onclick=fn}
function banner(ok,html,note){app.querySelectorAll('.sheet').forEach(x=>x.remove());const d=document.createElement('div');d.className='sheet '+(ok?'ok':'no')+(note?' note':'');d.innerHTML=note?`<b>${note}</b><small>${html}</small><button class="btn" id="nx">${T('cont')}</button>`:ok?`<b>${pick(T('praise'),1)[0]}</b>`:`<small>${T('correctSol')}</small><b>${html}</b>`;app.appendChild(d)}
function bump(){const t=dstr(0);if(S.last!=t){if(S.last==dstr(-1))S.streak++;else if(S.last==dstr(-2)&&S.fz>0&&S.streak>0){S.fz--;S.streak++;toast('❄️ '+T('freezeItem'))}else S.streak=1;S.last=t}}

/* ===== home: learning path, practice, exams, profile ===== */
const TABS=[['learn','🏠'],['prac','💪'],['exam','🏆'],['me','👤']];
const SEC={A1:['#58cc02','#58a700'],A2:['#1cb0f6','#1899d6'],B1:['#ce82ff','#a560d6'],B2:['#ff9600','#d67b00']};
const P=u=>S.prog[u.id]||0,unitDone=u=>P(u)>=5;
const mlvl=t=>Math.min(5,1+Math.floor((S.w[t]||0)/6));
function nav(){$('#nav').innerHTML=TABS.map(([k,i])=>`<button class="${S.tab==k?'on':''}" data-t="${k}"><span>${i}</span>${T('tab_'+k)}</button>`).join('');
 document.querySelectorAll('#nav [data-t]').forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;save();home()})}
function path(){const cur=UNITS.findIndex(u=>!unitDone(u));let h='';
 ['A1','A2','B1','B2'].forEach(l=>{const[c,d]=SEC[l];let k=0;
  h+=`<div class="ban" style="background:${c};box-shadow:0 4px 0 ${d}"><div><small>${T('section')} ${l}</small><b>${T('lv_'+l)}</b></div><span>📖</span></div><div class="trail" style="--c:${c};--d:${d}">`;
  UNITS.forEach((u,i)=>{if(u.lvl!=l)return;const x=Math.round(Math.sin(k++*Math.PI/2.4)*46),done=unitDone(u),now=i==cur;
   h+=`<div class="nd" style="--x:${x}px">${now?`<div class="start">${T('start')}<i></i></div>`:''}<button class="bub ${done?'done':now?'now':'off'}" data-i="${i}" aria-label="${esc(uTitle(u))}">${done?'✔':u.icon}</button><small>${esc(uTitle(u))}<br>${P(u)}/5</small></div>`});
  h+='</div>'});return h}
function wordsList(q){const ws=ALL.filter(p=>S.w[p.tr]!=null&&(!q||norm(p.tr).includes(q)||norm(bt(p)).includes(q)||norm(p.en).includes(q)));
 return ws.length?ws.map(p=>{const m=mlvl(p.tr);return`<div class="wr"><button class="sp sm" data-say="${esc(p.tr)}" aria-label="🔊">🔊</button><div class="wm"><b>${TR(p.tr)}</b><small>${B(bt(p))}</small></div><span class="dots" dir="ltr" title="${T('mlvl',m)}">${'●'.repeat(m)+'○'.repeat(5-m)}</span></div>`}).join(''):`<p class="mut">${T('noWords')}</p>`}
function profile(){const nd=UNITS.filter(unitDone).length,nw=Object.keys(S.w).length;
 return`<div class="center"><div class="big mascot">${S.av}</div><h2>${esc(S.name)}</h2></div><div class="stats">${[['🔥',curStreak(),T('l_streak')],['⭐',S.xp,T('l_xp')],['📘',nd+'/'+UNITS.length,T('l_units')],['🧠',Object.keys(S.miss).length,T('l_review')]].map(([i,v,t])=>`<div class="pst"><b>${i} ${v}</b><small>${t}</small></div>`).join('')}</div>${profileExtras()}
 <p class="mut center" id="sync">${syncText()}</p><p class="mut center" id="tts"></p><div id="ntf" class="center"></div><button class="btn alt" id="pw">🔑 ${T('changePw')}</button><button class="btn alt" id="lo">${T('logout')} · ${esc(S.name)}</button><h3>${T('lang')}</h3><div class="langs">${Object.keys(LANGS).map(k=>`<button class="opt ${k==S.lang?'sel':''}" data-l="${k}">${LANGS[k].n}</button>`).join('')}</div>
 <h3>${T('learned')} (${nw})</h3><input id="wq" placeholder="${T('search')}"><div id="wl">${wordsList('')}</div><button class="btn red" id="rs">${T('reset')}</button>`}
function profBind(){const lo=$('#lo');if(!lo)return;notifyUi();ttsInfo();profileExtrasBind();lo.onclick=logout;$('#pw').onclick=pwModal;
 app.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{S.lang=b.dataset.l;save();applyLang();home()});
 bindSay($('#wl'));$('#wq').oninput=()=>{$('#wl').innerHTML=wordsList(norm($('#wq').value));bindSay($('#wl'))};
 $('#rs').onclick=()=>{if(confirm(T('resetQ'))){Object.assign(S,{xp:0,streak:0,last:'',prog:{},miss:{},exams:{},w:{}});resetExtra();save(true);home()}}}
function home(){document.body.classList.remove('focus');head();nav();
 app.innerHTML=`<div class="slide">${S.tab=='prac'?menu():S.tab=='exam'?examsView():S.tab=='me'?profile():homeExtras()+path()}</div>`;
 app.querySelectorAll('.bub[data-i]').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,u=UNITS[i];if(!unitDone(u)&&i>UNITS.findIndex(x=>!unitDone(x)))return toast(T('unitLocked'));unit(u)});menuBind();profBind();extrasBind();window.scrollTo&&window.scrollTo(0,0)}

/* ===== unit screen: tip, 5 sequential levels, word list ===== */
function unit(u){document.body.classList.add('focus');setBack(home);const p=P(u);
 app.innerHTML=`<div class="center slide"><div class="big mascot">${u.icon}</div><h2>${esc(uTitle(u))}</h2><span class="lv">${u.lvl}</span></div><div class="tip">💡 ${esc(uTip(u))}</div>${unitExtras(u)}`+
 [1,2,3,4,5].map(L=>{const ok=p>=L,lock=L>p+1;return`<button class="lvr ${ok?'ok':lock?'lock':'cur'}" data-lv="${L}"><i>${ok?'✔':lock?'🔒':L}</i><span>${L==5?'🏆 '+T('mastery'):T('stage')+' '+L}<small>${lock?T('lockedHint'):L==5?T('examHint'):sliceObjs(u,L).map(x=>TR(pers(x).tr)).join(' · ')}</small></span></button>`}).join('')+
 `<h3>${T('words')}</h3>`+ITEMS(u.id).map(pers).map(x=>`<button class="opt" data-say="${esc(x.tr)}">🔊 <b>${TR(x.tr)}</b><small>${B(bt(x))}</small></button>`).join('');
 unitExtrasBind(u);bindSay(app);app.querySelectorAll('.lvr[data-lv]').forEach(b=>b.onclick=()=>lesson(u,+b.dataset.lv));window.scrollTo&&window.scrollTo(0,0)}

/* ===== path lesson: 90% to pass, wrong answers must be answered correctly twice ===== */
function lesson(u,L){const focus=sliceObjs(u,L),ex=L>=5;
 run({unit:u.id,exam:ex,qs:levelQs(u,L),hearts:1,strict:1,pass:90,retry:()=>lesson(u,L),after:()=>unit(u),exit:()=>unit(u),
  onEnd:(acc,ok,hr,cor)=>{if(!ok)return 0;const g=(ex?30:15)+hr*3;bump();S.xp+=g;S.prog[u.id]=Math.max(P(u),L);
   Object.keys(cor).forEach(t=>{if(S.w[t]!=null||focus.some(p=>p.tr==t))S.w[t]=Math.min(40,(S.w[t]||0)+cor[t])});
   focus.forEach(p=>{if(S.w[p.tr]==null)S.w[p.tr]=0});return g}})}

/* "are you sure?" popup in the middle of the screen when leaving a lesson */
function leaveAsk(quit){if($('.leave:not(.place)'))return;const d=document.createElement('div');d.className='leave';
 d.innerHTML=`<div class="lc" role="dialog" aria-modal="true"><div class="big">🦊</div><h2>${T('leaveT')}</h2><p>${T('leaveQ')}</p><button class="btn" id="lv-c">${T('cont')}</button><button class="btn red" id="lv-q">${T('quit')}</button></div>`;
 document.body.appendChild(d);$('#lv-c').onclick=()=>d.remove();$('#lv-q').onclick=()=>{d.remove();quit()}}
/* generic runner: queue of questions (choice / type / listen / build / match) */
function run(cfg){document.body.classList.add('focus');
 const T0=Date.now(),qs=cfg.qs.slice(),W=new Set(),cor={};let N=qs.length,rec=null,total=qs.reduce((s,q)=>s+q.need,0),done=0,hearts=cfg.hearts?5:99,live=true,busy=false;
 const stopRec=()=>{try{rec&&rec.abort()}catch(e){}rec=null};
 setBack(()=>leaveAsk(()=>{live=false;stopRec();document.querySelectorAll('.skipq').forEach(x=>x.remove());(cfg.exit||home)()}));
 const hr=()=>cfg.hearts?'❤️ '+hearts:'📝',pct=()=>N?Math.round(100*(N-W.size)/N):100,bar=()=>{const i=$('.bar i');if(i)i.style.width=Math.min(100,done/total*100)+'%'};
 const purge=kind=>{const before=qs.length;for(let i=qs.length-1;i>=0;i--){const x=qs[i];if(kind=='listen'){if(x.kind=='ls')qs.splice(i,1);else if(x.k=='match')x.audio=false}else if(x.k=='say')qs.splice(i,1)}
  N=Math.max(1,N-(before-qs.length));total=done+qs.reduce((s,q)=>s+q.need,0);if(kind=='listen'&&cfg.unit)NOLISTEN.add(cfg.unit);if(kind=='speak')NOSPEAK=true;bar()};
 const askSkip=(kind,then)=>skipSheet(kind,()=>{purge(kind);then&&then()});
 const next=()=>{if(!live)return;stopRec();busy=false;if(cfg.hearts&&hearts<=0)return fin(0);if(!qs.length)return fin(1);draw(qs[0])};
 const judge=(q,ok,g)=>{if(busy)return;busy=true;sfx(ok);qs.shift();document.querySelectorAll('.skipq').forEach(x=>x.remove());
  if(ok){done++;q.need--;q.trs.forEach(t=>{cor[t]=(cor[t]||0)+1;if(q.rev&&S.miss[t])delete S.miss[t];srGood(t)});if(q.need>0)qs.splice(Math.min(qs.length,3+(Math.random()*3|0)),0,q);if(q.ans&&!q.say)speak(q.ans)}
  else{W.add(q.uid);if(cfg.hearts)hearts--;if(cfg.strict){total+=2-q.need;q.need=2}if(q.k!='match')missMark(q.tr);qs.splice(Math.min(qs.length,2+(Math.random()*2|0)),0,q);const bd=$('.body');bd&&bd.classList.add('shake')}
  const h=$('.hr');if(h)h.textContent=hr();bar();save();
  const note=ok&&g&&g.note;
  banner(ok,note?`<span class="tr" lang="tr" dir="ltr">${markDiff(g.typed,q.full&&q.k!='type'?q.full:q.ans)}</span>`:q.k=='match'?q.pairs.map(p=>TR(p.tr)+' = '+B(bt(p))).join('<br>'):q.k=='pic'?q.pic+' '+B(q.ans):q.opt||(q.k=='choice'&&q.dir=='b')?B(q.ans):TR(q.full||q.ans),note?T(g.note=='typo'?'typoNote':'accentNote'):'');
  if(note){const nx=()=>{document.removeEventListener('keydown',kd);if(live)next()},kd=e=>{if(e.key=='Enter')nx()};$('#nx').onclick=nx;setTimeout(()=>document.addEventListener('keydown',kd),200);return}
  setTimeout(next,ok?800:q.k=='choice'?1700:2300)};
 const draw=q=>{const top=`<div class="top"><div class="bar"><i style="width:${Math.min(100,done/total*100)}%"></i></div><b class="hr">${hr()}</b></div>`,
   sen=q.sen?`<div class="sbox" dir="ltr" lang="tr">${q.sen}</div>`:'',
   row=q.chr?`<div class="sp2"><i>${q.chr}</i><div class="bb">${q.say?'<button class="sp sm" id="sp" aria-label="🔊">🔊</button> ':''}${q.showH}</div></div>${sen}`:(q.say||q.showH)?`<div class="say">${q.say?'<button class="sp" id="sp" aria-label="🔊">🔊</button>':''}${q.showH?`<span>${q.showH}</span>`:''}</div>${sen}`:sen,head=`${top}<div class="body slide"><div class="q">${q.pr}</div>`;
  window.scrollTo&&window.scrollTo(0,0);
  if(q.k=='match'){app.innerHTML=head+'<div id="mh"></div></div>';return mtc($('#mh'),q.pairs,ok=>judge(q,ok),q.audio,then=>askSkip('listen',then))}
  if(q.k=='build'){app.innerHTML=head+row+'<div id="bh"></div></div>';if(q.say)speak(q.say);if(q.say&&$('#sp'))$('#sp').onclick=()=>speak(q.say);return bld($('#bh'),q.ans,ok=>judge(q,ok),q.opt)}
  if(q.k=='say'){app.innerHTML=head+row+`<button class="mic" id="mic" aria-label="🎤">🎤</button><p class="mut center" id="heard">${T('tapMic')}</p><button class="btn alt" id="ns">${T('cantSpeak')}</button></div>`;
   $('#sp').onclick=()=>speak(q.say);speak(q.say);let tries=0;const mic=$('#mic'),hd=$('#heard'),off=()=>mic.classList.remove('on');
   $('#ns').onclick=()=>askSkip('speak',next);
   /* every speaking question: let the device ask for the microphone if it is not allowed yet (no custom explanation) */
   const gate=async()=>{const r=await micEnsure();if(!live||busy)return false;
    if(r=='granted'){if(hd.dataset.err){hd.textContent=T('tapMic');delete hd.dataset.err}return true}
    if(r=='denied'){hd.dataset.err=1;hd.textContent=T('micOff');return false}
    hd.dataset.err=1;hd.textContent=T(r=='nomic'?'micNone':r=='unsupported'?'ntInsecure':'micErr');return false};
   gate();
   mic.onclick=async()=>{if(busy)return;if(rec){stopRec();off();hd.textContent=T('tapMic');return}if(!(await gate()))return;mic.classList.add('on');hd.textContent=T('listening');
    rec=listenTr((e,alts)=>{rec=null;off();if(!live||busy)return;
     if(e){if(e=='no-speech'||e=='aborted'){hd.textContent=T('noSpeech');return}
      hd.textContent=T(e=='not-allowed'||e=='service-not-allowed'?'micApp':'micErr');setTimeout(()=>{if(live&&!busy){purge('speak');next()}},2200);return}
     hd.innerHTML=pronHtml(alts,q.ans);if(sayOk(alts,q.ans))return judge(q,true);if(++tries<2){hd.insertAdjacentHTML('beforeend',' — '+esc(T('tryAgain')));return}judge(q,false)})};return}
  if(q.k=='pic'){app.innerHTML=head+row+`<div class="pics">${q.popts.map((o,i)=>`<button class="pic" data-o="${i}"><span>${o.e}</span><small>${B(o.l)}</small></button>`).join('')}</div></div>`;
   $('#sp').onclick=()=>speak(q.say);speak(q.say);const pb=[...app.querySelectorAll('[data-o]')];
   return pb.forEach((b,i)=>b.onclick=()=>{if(busy)return;const ok=q.popts[i].ok;b.classList.add(ok?'good':'bad');if(!ok)pb[q.popts.findIndex(x=>x.ok)].classList.add('good');judge(q,ok)})}
  if(q.k=='choice'){const os=opts(q);app.innerHTML=head+row+os.map((o,i)=>`<button class="opt" data-o="${i}">${q.dir=='b'?B(o):TR(o)}</button>`).join('')+'</div>';
   if(q.say){$('#sp').onclick=()=>speak(q.say);speak(q.say)}
   const bs=[...app.querySelectorAll('[data-o]')];
   return bs.forEach((b,i)=>b.onclick=()=>{if(busy)return;const ok=okAns(os[i],q.ans,false),ci=os.findIndex(o=>norm(o)==norm(q.ans));b.classList.add(ok?'good':'bad');if(!ok&&bs[ci])bs[ci].classList.add('good');judge(q,ok)})}
  app.innerHTML=head+row+`<input id="in" dir="ltr" lang="tr" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${T('typePh')}"></div><div class="sheet"><button class="btn dis" id="ck">${T('check')}</button></div>`;
  if(q.say){$('#sp').onclick=()=>speak(q.say);speak(q.say)}
  if(q.kind=='ls'){const nl=document.createElement('button');nl.id='nl';nl.className='btn alt';nl.textContent=T('cantListen');nl.onclick=()=>askSkip('listen',next);$('.body').appendChild(nl)}
  const inp=$('#in'),go=()=>{if(busy||!inp.value.trim())return;const g=grade(inp.value,q.ans);inp.classList.add(g.ok?'good':'bad');inp.readOnly=true;judge(q,!!g.ok,g)};
  inp.oninput=()=>$('#ck').classList.toggle('dis',!inp.value.trim());inp.addEventListener('keydown',e=>{if(e.key=='Enter')go()});$('#ck').onclick=go;setTimeout(()=>inp.focus&&inp.focus(),60)};
 const fin=win=>{live=false;try{logRun((Date.now()-T0)/1000,N-W.size,N,pct(),cfg)}catch(e){}const acc=pct(),ok=win&&acc>=cfg.pass,out=cfg.hearts&&hearts<=0,xp=cfg.onEnd?cfg.onEnd(acc,ok,hearts,cor)||0:0;
  if(ok){confetti();sfx(true)}save();head();
  app.innerHTML=`<div class="fin"><div class="big mascot">${ok?(cfg.exam?'🏆':'🦊'):out?'💔':'📘'}</div><h2>${ok?(cfg.exam?T('passed'):T('complete')):out?T('noHearts'):T('failed')}</h2><div class="stats2">${xp?`<div class="st gold"><small>${T('xpL')}</small><b>⚡ ${xp}</b></div>`:''}<div class="st grn"><small>${T('acc')}</small><b>🎯 ${acc}%</b></div></div>${ok?'':`<p>${out?T('hearts0'):T('need',cfg.pass)}</p>`}</div><div class="sheet"><button class="btn" id="h">${T('cont')}</button>${!ok&&cfg.retry?`<button class="btn alt" id="rt">${T('retry')}</button>`:''}</div>`;
  const go=cfg.after||home;$('#h').onclick=go;if($('#rt'))$('#rt').onclick=cfg.retry;setBack(go)};
 next()}

/* ===== boot ===== */
applyLang();boot();micFirstRun();
(function midnight(){const n=new Date();setTimeout(()=>{if(S&&!document.body.classList.contains('focus'))home();else if(S)head();midnight()},new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,0,0,1)-n+500)})();
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S)head()});
if('serviceWorker'in navigator&&!window.AndroidApp)navigator.serviceWorker.register('sw.js').catch(()=>{});
