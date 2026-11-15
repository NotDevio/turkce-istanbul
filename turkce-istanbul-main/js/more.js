/* ===== extras: daily goal, streak freeze, badges, XP shop, weekly league + summary, spaced repetition, themes,
   placement test, and the extra practice modes (weak words, timed, stories, dialogues, suffixes, dictation, grammar). ===== */
Object.assign(UI.en,{
 goalT:'Daily goal',goalOf:(a,b)=>`${a} / ${b} XP today`,goalDone:'Daily goal reached! 🎉',goalPick:'Pick your daily goal',wotdT:'Word of the day',
 m_sr:'Review',d_sr:n=>`${n} words are due`,badgesT:'Badges',badgeNew:'New badge:',
 b_streak7:'7-day streak',b_streak30:'30-day streak',b_perfect:'Perfect exam',b_words100:'100 words learned',b_words300:'300 words learned',b_units10:'10 units done',b_xp1000:'1,000 XP',b_timed:'Timed master (15+)',b_story:'Story reader',
 shopT:'XP shop',shopBal:n=>`Balance: ${n} ⭐`,noXp:'Not enough XP',avatarsT:'Avatars',freezeItem:'Streak freeze',freezeDesc:'Protects one missed day',fzHave:n=>`you have ${n} ❄️ (max 2)`,
 leagueT:'Weekly league',leagueEmpty:'Nobody has earned XP this week yet',you:'you',
 weekT:'This week',wk_xp:'XP',wk_min:'minutes',wk_acc:'accuracy',wk_words:'new words',wk_days:'active days',
 themeT:'Appearance',th_auto:'Auto',th_light:'Light',th_dark:'Dark',remAt:'Reminder time',adminT:'Admin page',
 m_weak:'Weak words',d_weak:n=>`${n} to practise`,m_old:'Refresh units',d_old:'Units you finished',m_timed:'Timed challenge',d_timed:'60 seconds',m_story:'Stories',d_story:'Read and tap',
 m_dlg:'Dialogues',d_dlg:'Pick your reply',m_suf:'Suffixes',d_suf:'ev + de = ?',m_dikt:'Dictation',d_dikt:'Hear and type',m_gram:'Grammar',d_gram:'Short cards',m_place:'Placement test',d_place:'Skip what you know',
 timedInfo:'Answer as many questions as you can in 60 seconds.',timedGo:'Start',timedScore:n=>`${n} correct`,timedXp:n=>`+${n} XP`,
 storyTap:'Tap a word to see its meaning',storyQ:'Question',storyOk:'Correct! +10 XP',storyNo:'Not quite, read it again',
 dlgDone:'Conversation complete! +5 XP',dlgBad:'Try another reply',
 sufQ:'Build the word',sf_pl:'plural',sf_loc:'in / at',sf_abl:'from',sf_dat:'to',sf_acc:'the (object)',sf_gen:'of (the owner)',sf_poss:'my',
 sf_v:(v,r)=>`Last vowel “${v}” gives the suffix vowel “${r}”.`,sf_hard:c=>`“${c}” is a hard consonant, so d becomes t.`,sf_buf:b=>`The word ends in a vowel, so the buffer letter “${b}” is added.`,
 sf_soft:(a,b)=>`The final “${a}” softens to “${b}” before a vowel.`,sf_m:'After a vowel the suffix is just -m.',
 placeTitle:'Find your level',placeText:'Answer a few questions and we will unlock the units you already know.',placeStart:'Start the test',placeSkip:'Start from the beginning',placeDone:n=>n?`Done! ${n} units unlocked.`:'We will start from the beginning.',
 gramT:'Grammar',cultT:'Culture note',noOld:'You have not finished a unit yet',noVoice:'No Turkish voice found on this device'});
Object.assign(UI.ar,{
 goalT:'الهدف اليومي',goalOf:(a,b)=>`${a} / ${b} نقطة اليوم`,goalDone:'تم تحقيق الهدف اليومي! 🎉',goalPick:'اختر هدفك اليومي',wotdT:'كلمة اليوم',
 m_sr:'مراجعة',d_sr:n=>`${n} كلمة مستحقة`,badgesT:'الأوسمة',badgeNew:'وسام جديد:',
 b_streak7:'سلسلة ٧ أيام',b_streak30:'سلسلة ٣٠ يوماً',b_perfect:'اختبار كامل',b_words100:'تعلّمت ١٠٠ كلمة',b_words300:'تعلّمت ٣٠٠ كلمة',b_units10:'١٠ وحدات مكتملة',b_xp1000:'١٠٠٠ نقطة',b_timed:'بطل التحدي (١٥+)',b_story:'قارئ القصص',
 shopT:'متجر النقاط',shopBal:n=>`الرصيد: ${n} ⭐`,noXp:'نقاطك غير كافية',avatarsT:'الصور الرمزية',freezeItem:'تجميد السلسلة',freezeDesc:'يحمي يوماً فائتاً واحداً',fzHave:n=>`لديك ${n} ❄️ (الحد الأقصى ٢)`,
 leagueT:'الدوري الأسبوعي',leagueEmpty:'لم يكسب أحد نقاطاً هذا الأسبوع بعد',you:'أنت',
 weekT:'هذا الأسبوع',wk_xp:'نقطة',wk_min:'دقيقة',wk_acc:'الدقة',wk_words:'كلمة جديدة',wk_days:'أيام نشطة',
 themeT:'المظهر',th_auto:'تلقائي',th_light:'فاتح',th_dark:'داكن',remAt:'وقت التذكير',adminT:'صفحة الإدارة',
 m_weak:'الكلمات الضعيفة',d_weak:n=>`${n} للتدرّب`,m_old:'مراجعة الوحدات',d_old:'وحدات أنهيتها',m_timed:'تحدي الوقت',d_timed:'٦٠ ثانية',m_story:'قصص',d_story:'اقرأ واضغط',
 m_dlg:'حوارات',d_dlg:'اختر ردّك',m_suf:'اللواحق',d_suf:'ev + de = ؟',m_dikt:'إملاء',d_dikt:'استمع واكتب',m_gram:'القواعد',d_gram:'بطاقات قصيرة',m_place:'اختبار تحديد المستوى',d_place:'تخطَّ ما تعرفه',
 timedInfo:'أجب عن أكبر عدد ممكن من الأسئلة خلال ٦٠ ثانية.',timedGo:'ابدأ',timedScore:n=>`${n} إجابة صحيحة`,timedXp:n=>`+${n} نقطة`,
 storyTap:'اضغط على كلمة لترى معناها',storyQ:'سؤال',storyOk:'صحيح! +١٠ نقاط',storyNo:'ليس تماماً، اقرأ مرة أخرى',
 dlgDone:'اكتمل الحوار! +٥ نقاط',dlgBad:'جرّب رداً آخر',
 sufQ:'ابنِ الكلمة',sf_pl:'جمع',sf_loc:'في',sf_abl:'من',sf_dat:'إلى',sf_acc:'المفعول المعرّف',sf_gen:'إضافة (المالك)',sf_poss:'ملكيتي',
 sf_v:(v,r)=>`آخر حرف علة «${v}» يعطي حرف علة اللاحقة «${r}».`,sf_hard:c=>`«${c}» حرف صلب، لذلك يتحوّل d إلى t.`,sf_buf:b=>`الكلمة تنتهي بحرف علة، لذلك نضيف حرف الوصل «${b}».`,
 sf_soft:(a,b)=>`الحرف الأخير «${a}» يلين إلى «${b}» قبل حرف العلة.`,sf_m:'بعد حرف العلة تكون اللاحقة -m فقط.',
 placeTitle:'اعثر على مستواك',placeText:'أجب عن بضعة أسئلة وسنفتح لك الوحدات التي تعرفها.',placeStart:'ابدأ الاختبار',placeSkip:'ابدأ من البداية',placeDone:n=>n?`انتهى! تم فتح ${n} وحدة.`:'سنبدأ من البداية.',
 gramT:'القواعد',cultT:'ملاحظة ثقافية',noOld:'لم تنهِ أي وحدة بعد',noVoice:'لا يوجد صوت تركي على هذا الجهاز'});

Object.assign(UI.en,{updT:'App updates',updCheck:'Check for updates',updWeb:'Refresh the app now',updSrv:'Change server address',updVer:'Version'});
Object.assign(UI.ar,{updT:'تحديثات التطبيق',updCheck:'التحقق من التحديثات',updWeb:'تحديث التطبيق الآن',updSrv:'تغيير عنوان الخادم',updVer:'الإصدار'});
Object.assign(UI.en,{dlApp:'Download the Android app'});Object.assign(UI.ar,{dlApp:'حمّل تطبيق أندرويد'});
/* download-page button: only in a normal browser (never inside the Android app or an installed web app), and only if the server has the APK */
let APK=null;
const inBrowser=()=>!window.AndroidApp&&!(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)&&!navigator.standalone;
const dlBtn=()=>APK&&inBrowser()?`<a class="btn alt dl" href="download.html">📱 ${T('dlApp')}</a>`:'';
(async()=>{if(!inBrowser())return;try{APK=(await fetch('app/latest.apk',{method:'HEAD'})).ok}catch(e){APK=false}
 const mc=document.querySelector('.modal.auth .mc');if(APK&&mc&&!mc.querySelector('.dl'))mc.insertAdjacentHTML('beforeend',dlBtn())})();
const L2=a=>a[LC()=='ar'?1:0],gl=t=>LC()=='ar'?t.ar:t.en;
const dkey=()=>TRL.keyOf(new Date()),dnum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
const hhmm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const bal=()=>S.xp-(S.sp||0);

/* ----- theme: auto follows the phone; light / dark are chosen by the learner ----- */
try{document.documentElement.dataset.theme=localStorage.getItem('tri_theme')||'auto'}catch(e){}
function applyTheme(){let t='auto';try{t=(S&&S.th)||localStorage.getItem('tri_theme')||'auto'}catch(e){}document.documentElement.dataset.theme=t;
 const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t=='dark'||(t=='auto'&&matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches)?'#131f24':'#58cc02'}

/* ----- state defaults, daily tracking, badges ----- */
let LX=null,LW=0;
function resetTrack(clear){LX=clear||!S?null:S.xp;LW=S?Object.keys(S.w||{}).length:0}
function ensure(){if(!S)return;
 if(S.rem==null)S.rem=1200;if(![10,20,30].includes(S.goal))S.goal=20;S.th=S.th||'auto';S.fz=S.fz||0;S.sp=S.sp||0;S.pl=S.pl||0;
 for(const k of['own','bd','sto','mc','sr','log'])S[k]=S[k]||{};S.dxp=S.dxp||{d:'',xp:0};
 if(LX===null){LX=S.xp;LW=Object.keys(S.w).length;Object.keys(S.miss).forEach(t=>{if(S.sr[t]==null)S.sr[t]=dnum()*10;if(!S.mc[t])S.mc[t]=1})}   // words you already missed join the review schedule
 applyTheme()}
const todayLog=()=>{const k=dkey();return S.log[k]||(S.log[k]=[0,0,0,0,0])};
function track(){if(!S)return;ensure();const dx=S.xp-LX,nw=Object.keys(S.w).length,dw=nw-LW;LX=S.xp;LW=nw;
 if(dx>0||dw>0){const L=todayLog();if(dx>0)L[0]+=dx;if(dw>0)L[4]+=dw;const ks=Object.keys(S.log).sort();ks.slice(0,Math.max(0,ks.length-21)).forEach(k=>delete S.log[k])}
 if(dx>0){const k=dkey();if(S.dxp.d!=k)S.dxp={d:k,xp:0};const was=S.dxp.xp;S.dxp.xp+=dx;if(was<S.goal&&S.dxp.xp>=S.goal){toast(T('goalDone'));confetti()}}
 badges()}
function logRun(sec,ok,n,acc,cfg){if(!S)return;ensure();const L=todayLog();L[1]=Math.min(86400,L[1]+Math.round(Math.min(sec,1800)));L[2]+=ok;L[3]+=n;if(cfg&&cfg.exam&&acc>=100)award('perfect')}
function resetExtra(){S.sp=0;S.fz=0;S.own={};S.bd={};S.sto={};S.mc={};S.sr={};S.log={};S.dxp={d:'',xp:0};LX=0;LW=0}
const BADGES=[['streak7','🔥',()=>curStreak()>=7],['streak30','🏅',()=>curStreak()>=30],['perfect','💯',null],['words100','📘',()=>Object.keys(S.w).length>=100],['words300','📚',()=>Object.keys(S.w).length>=300],
 ['units10','🏆',()=>UNITS.filter(unitDone).length>=10],['xp1000','⭐',()=>S.xp>=1000],['timed','⏱️',null],['story','📖',()=>STORIES.every(s=>S.sto[s.id])]];
function award(id){if(!S||S.bd[id])return;S.bd[id]=1;const b=BADGES.find(x=>x[0]==id);toast(T('badgeNew')+' '+b[1]+' '+T('b_'+id),4500);confetti()}
function badges(){BADGES.forEach(([id,,f])=>{if(f&&!S.bd[id]&&f())award(id)})}

/* ----- missed words: counted (mistakes deck) and scheduled for spaced repetition (1, 3, 7, 14 days) ----- */
function missMark(t){ensure();S.miss[t]=1;S.mc[t]=Math.min(999,(S.mc[t]||0)+1);S.sr[t]=TRL.srMiss(dnum())}
function srGood(t){if(!S||!S.sr||S.sr[t]==null)return;const n=TRL.srOk(S.sr[t],dnum());if(n==null)delete S.sr[t];else S.sr[t]=n}
const dueWords=()=>Object.keys(S.sr||{}).filter(t=>byTr(t)&&TRL.srDue(S.sr[t],dnum()));
const weakWords=()=>Object.keys(S.mc||{}).filter(t=>byTr(t)&&S.mc[t]>0).sort((a,b)=>S.mc[b]-S.mc[a]);

/* ----- pronunciation: show which words were recognised ----- */
function pronHtml(alts,target){const r=alts.map((a,i)=>({i,...TRL.pronScore(a,target,norm)})).sort((a,b)=>b.pct-a.pct)[0];
 return`${T('heard')} ${esc(alts[r.i])}<br><span class="pron" dir="ltr" lang="tr">${r.words.map(x=>`<span class="${x.ok?'pg':'pb'}">${esc(x.w)}</span>`).join(' ')}</span> <b class="pp">${r.pct}%</b>`}

/* ----- small helpers ----- */
const empty=k=>{app.innerHTML=`<div class="center"><div class="big">✨</div><h2>${T(k)}</h2></div><button class="btn" id="h">${T('done')}</button>`;$('#h').onclick=home};
function reviewSet(words,kinds=['c1','c2','ty']){const it=words.slice(0,8);while(it.length<4){const x=pick(ALL,1)[0];if(!it.includes(x))it.push(x)}
 const qs=spread(shuf(it.flatMap(p=>kinds.map(k=>{const q=mkQ(k,p,it);q.rev=1;return q}))));
 run({qs,hearts:1,strict:0,pass:0,after:home,onEnd:(acc,ok)=>{if(ok)S.xp+=10;return ok?10:0}})}

/* ----- home: daily goal ring, review chip, word of the day ----- */
function wotd(){const pool=ALL.filter(p=>p.tr.split(' ').length<=2),d=new Date(),n=d.getFullYear()*372+d.getMonth()*31+d.getDate();return pool[(n*2654435761>>>0)%pool.length]}
function homeExtras(){ensure();const g=S.goal,x=S.dxp.d==dkey()?S.dxp.xp:0,pc=Math.min(1,x/g),R=26,C=2*Math.PI*R,due=dueWords().length,w=wotd();
 return`<div class="hx"><div class="ring" id="goal" role="button" tabindex="0"><svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--line)" stroke-width="8"/><circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--g)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(C*pc).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><b>${x>=g?'✔':Math.round(pc*100)+'%'}</b></div><div class="hxt"><b>${T('goalT')}</b><small>${T('goalOf',Math.min(x,g),g)}</small></div>${S.fz?`<span class="chip">❄️ ${S.fz}</span>`:''}</div>`+
 (due?`<button class="pc row" data-m="sr"><span>🔁</span><div><b>${T('m_sr')}</b><small>${T('d_sr',due)}</small></div></button>`:'')+
 `<div class="wotd"><button class="sp sm" data-say="${esc(w.tr)}" aria-label="🔊">🔊</button><div class="wm"><small>${T('wotdT')}</small><b>${TR(w.tr)}</b><small>${B(bt(w))}</small></div></div>`}
function extrasBind(){const g=$('#goal');if(g)g.onclick=()=>{S.tab='me';save();home()};const w=$('.wotd');if(w)bindSay(w);maybePlace()}

/* ----- unit screen: culture note + grammar card ----- */
function unitExtras(u){const i=UNITS.indexOf(u);return`<div class="cult">🏛️ <b>${T('cultT')}:</b> ${esc(cultNote(u,i))}</div>`+(i>=0&&i<GRAM.length?`<button class="opt" id="gm">📐 ${T('gramT')}: ${esc(L2(GRAM[i].t))}</button>`:'')}
function unitExtrasBind(u){const g=$('#gm');if(g)g.onclick=()=>gramCard(UNITS.indexOf(u),()=>unit(u))}

/* ----- profile: weekly summary, goal, league, badges, XP shop, appearance ----- */
const AVSHOP=['🐲','🦅','🦋','🐬','🦖','🐺','🦩','🦥'],COST_AV=40,COST_FZ=50;
function profileExtras(){ensure();const w=TRL.weekSummary(S.log),mx=Math.max(1,...w.days.map(d=>d.xp)),wd=d=>{try{return new Intl.DateTimeFormat(LC(),{weekday:'narrow'}).format(new Date(d.k+'T12:00:00'))}catch(e){return''}};
 const owned=a=>AVS.includes(a)||S.own[a];
 return`<h3>📅 ${T('weekT')}</h3><div class="bars" dir="ltr">${w.days.map(d=>`<div><i style="height:${Math.max(4,Math.round(d.xp/mx*56))}px"></i><small>${wd(d)}</small></div>`).join('')}</div>
 <div class="stats">${[['⭐',w.xp,T('wk_xp')],['⏱️',w.min,T('wk_min')],['🎯',w.acc+'%',T('wk_acc')],['📘',w.words,T('wk_words')],['📅',w.active+'/7',T('wk_days')]].map(([i,v,t])=>`<div class="pst"><b>${i} ${v}</b><small>${t}</small></div>`).join('')}</div>
 <h3>🎯 ${T('goalPick')}</h3><div class="langs">${[10,20,30].map(n=>`<button class="opt ${S.goal==n?'sel':''}" data-goal="${n}">${n} XP</button>`).join('')}</div>
 <h3>🏆 ${T('leagueT')}</h3><div id="lg" class="mut">…</div>
 <h3>🎖️ ${T('badgesT')}</h3><div class="badges">${BADGES.map(([id,ic])=>`<div class="bd ${S.bd[id]?'on':''}"><span>${ic}</span><small>${T('b_'+id)}</small></div>`).join('')}</div>
 <h3>🛒 ${T('shopT')}</h3><p class="mut">${T('shopBal',bal())}</p>
 <div class="srow"><span>❄️</span><div><b>${T('freezeItem')}</b><small>${T('freezeDesc')} · ${T('fzHave',S.fz)}</small></div><button class="btn alt ${S.fz>=2||bal()<COST_FZ?'dis':''}" data-buy="fz">${COST_FZ} ⭐</button></div>
 <h3>${T('avatarsT')}</h3><div class="avgrid">${[...AVS,...AVSHOP].map(a=>owned(a)?`<button class="av2 ${S.av==a?'sel':''}" data-av="${a}">${a}</button>`:`<button class="av2 lock ${bal()<COST_AV?'dis':''}" data-buy="${a}">${a}<small>${COST_AV}⭐</small></button>`).join('')}</div>
 <h3>🔄 ${T('updT')}</h3>${dlBtn()}${window.AndroidApp?`<p class="mut">${T('updVer')}: ${esc(AndroidApp.version())}</p><button class="btn alt" id="up-c">${T('updCheck')}</button><button class="btn alt" id="up-s">${T('updSrv')}</button>`:''}<button class="btn alt" id="up-w">${T('updWeb')}</button>
 <h3>🌗 ${T('themeT')}</h3><div class="langs">${['auto','light','dark'].map(k=>`<button class="opt ${S.th==k?'sel':''}" data-th="${k}">${T('th_'+k)}</button>`).join('')}</div>`}
function buy(what){const b=bal();
 if(what=='fz'){if(S.fz>=2)return;if(b<COST_FZ)return toast(T('noXp'));S.sp+=COST_FZ;S.fz++}
 else{if(S.own[what])return;if(b<COST_AV)return toast(T('noXp'));S.sp+=COST_AV;S.own[what]=1;S.av=what}
 sfx(true);save();head();home()}
async function loadLeague(){const h=$('#lg');if(!h)return;const r=await api('GET','/api/league');if(!$('#lg'))return;
 if(!r.ok){h.textContent='';return}
 h.innerHTML=(r.j.rows.length?r.j.rows.map((x,i)=>`<div class="lrow ${x.me?'me':''}"><b>${i+1}</b><span class="av">${esc(x.av)}</span><span class="ln">${esc(x.u)}${x.me?' · '+T('you'):''}</span><b>⭐ ${x.xp}</b></div>`).join(''):`<p class="mut">${T('leagueEmpty')}</p>`)+(r.j.admin?`<a class="btn alt" href="admin.html">🛠 ${T('adminT')}</a>`:'')}
async function refreshApp(){try{const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()))}catch(e){}try{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}catch(e){}try{sync(true)}catch(e){}location.reload()}
function profileExtrasBind(){loadLeague();
 $('#up-w')&&($('#up-w').onclick=refreshApp);$('#up-c')&&($('#up-c').onclick=()=>AndroidApp.checkUpdate());$('#up-s')&&($('#up-s').onclick=()=>AndroidApp.changeServer());
 app.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>{S.goal=+b.dataset.goal;save();home()});
 app.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buy(b.dataset.buy));
 app.querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{S.av=b.dataset.av;save();head();home()});
 app.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{S.th=b.dataset.th;try{localStorage.setItem('tri_theme',S.th)}catch(e){}applyTheme();save();home()})}

/* ----- practice modes ----- */
Object.assign(MODES,{
 sr:()=>reviewSet(shuf(dueWords().map(byTr))),
 weak:()=>{const w=weakWords().slice(0,8).map(byTr);w.length?reviewSet(w):empty('noMiss')},
 old:()=>{const l=ALL.filter(p=>(S.prog[p.id]||0)>=1);if(!l.length)return empty('noOld');reviewSet(pick(shuf(l).sort((a,b)=>(S.w[a.tr]||0)-(S.w[b.tr]||0)).slice(0,24),8))},
 dikt:()=>{if(typeof noTrVoice=='function'&&noTrVoice()){toast(T('noVoice'));return home()}
  const all=ALL.filter(p=>p.tr.split(' ').length>=3),learned=all.filter(p=>S.w[p.tr]!=null),src=learned.length>=4?learned:all,it=pick(src,6);
  run({qs:spread(shuf(it.map(p=>mkQ('ls',p,it)))),hearts:0,strict:0,pass:0,after:home,onEnd:(acc,ok)=>{if(ok)S.xp+=10;return ok?10:0}})},
 timed:()=>timed(),story:()=>storyList(),dlg:()=>dlgList(),suf:()=>suffixes(),gram:()=>gramList(),place:()=>placement()});

function timed(){app.innerHTML=`<div class="center slide"><div class="big">⏱️</div><h2>${T('m_timed')}</h2><p class="mut">${T('timedInfo')}</p></div><button class="btn" id="go">${T('timedGo')}</button>`;$('#go').onclick=startTimed}
function startTimed(){const lw=ALL.filter(p=>S.w[p.tr]!=null),pool=lw.length>=8?lw:ALL.filter(p=>p.lvl=='A1').concat(lw);let score=0,left=60,live=true,tm=0;
 const end=()=>{live=false;clearInterval(tm);const xp=Math.min(15,score);S.xp+=xp;if(score>=15)award('timed');save();head();if(xp)confetti();
  app.innerHTML=`<div class="center"><div class="big">⏱️</div><h2>${T('timedScore',score)}</h2><p class="mut">${xp?T('timedXp',xp):''}</p></div><button class="btn" id="ag">${T('retry')}</button><button class="btn alt" id="h">${T('done')}</button>`;$('#h').onclick=home;$('#ag').onclick=timed;setBack(home)};
 const draw=()=>{if(!live)return;const p=pick(pool,1)[0],q=mkQ(Math.random()<.5?'c1':'c2',p,pool),os=opts(q);
  app.innerHTML=`<div class="top"><div class="bar"><i style="width:${left/60*100}%"></i></div><b class="hr" id="tl">⏱️ ${left}</b></div><div class="body"><div class="q">${q.pr}</div><div class="tq">${q.showH}</div>${os.map((o,i)=>`<button class="opt" data-o="${i}">${q.dir=='b'?B(o):TR(o)}</button>`).join('')}</div>`;
  app.querySelectorAll('[data-o]').forEach((b,i)=>b.onclick=()=>{if(!live||b.dataset.d)return;app.querySelectorAll('[data-o]').forEach(x=>x.dataset.d=1);const ok=okAns(os[i],q.ans,false);b.classList.add(ok?'good':'bad');sfx(ok);if(ok)score++;else missMark(q.tr);setTimeout(draw,ok?250:500)})};
 tm=setInterval(()=>{if(!document.body.classList.contains('focus')){live=false;return clearInterval(tm)}left--;const t=$('#tl');if(t)t.textContent='⏱️ '+left;const i=$('.bar i');if(i)i.style.width=Math.max(0,left/60*100)+'%';if(left<=0)end()},1000);
 setBack(()=>{live=false;clearInterval(tm);home()});draw()}

function storyList(){setBack(home);app.innerHTML=`<h2>${T('m_story')}</h2>`+STORIES.map((s,i)=>`<button class="pc row" data-s="${i}"><span>${s.icon}</span><div><b>${esc(L2(s.title))}</b><small>${S.sto[s.id]?'✅ ':''}${T('storyTap')}</small></div></button>`).join('');
 app.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>readStory(+b.dataset.s))}
function readStory(i){const s=STORIES[i];setBack(storyList);
 app.innerHTML=`<div class="slide"><h2>${s.icon} ${esc(L2(s.title))}</h2><div class="story" dir="ltr" lang="tr">${s.tok.map((t,j)=>`<button class="w" data-j="${j}">${esc(t.tr)}</button>`).join(' ')}</div><p class="gloss mut" id="gl">${T('storyTap')}</p><button class="btn alt" id="rd" aria-label="🔊">🔊</button><h3>${T('storyQ')}</h3><div class="q">${esc(L2(s.q))}</div>${s.o.map((o,k)=>`<button class="opt" data-k="${k}">${esc(L2(o))}</button>`).join('')}</div>`;
 const clean=x=>x.replace(/[“”".,]/g,'');
 app.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{const t=s.tok[+b.dataset.j];$('#gl').innerHTML=`${TR(clean(t.tr))} → ${B(gl(t))}`;speak(clean(t.tr))});
 $('#rd').onclick=()=>speak(s.tok.map(t=>clean(t.tr)).join(' '));
 app.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const ok=+b.dataset.k==s.a;sfx(ok);b.classList.add(ok?'good':'bad');
  if(!ok)return toast(T('storyNo'));app.querySelectorAll('[data-k]').forEach(x=>x.disabled=true);
  if(!S.sto[s.id]){S.sto[s.id]=1;S.xp+=10;save();head();toast(T('storyOk'));confetti()}setTimeout(storyList,1300)})}

function dlgList(){setBack(home);app.innerHTML=`<h2>${T('m_dlg')}</h2>`+DIALOGS.map((d,i)=>`<button class="pc row" data-d="${i}"><span>${d.icon}</span><div><b>${esc(L2(d.title))}</b><small>${T('d_dlg')}</small></div></button>`).join('');
 app.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>playDlg(+b.dataset.d))}
function playDlg(i){const d=DIALOGS[i];let k=0,hist='';setBack(dlgList);
 const line=(t,side)=>`<div class="cl ${side}"><span dir="ltr" lang="tr">${esc(t.tr)}</span><small>${B(gl(t))}</small></div>`;
 const step=()=>{if(k>=d.steps.length){S.xp+=5;save();head();confetti();app.innerHTML=`<div class="center"><div class="big">${d.icon}</div><h2>${T('dlgDone')}</h2></div><div class="chat">${hist}</div><button class="btn" id="h">${T('done')}</button>`;$('#h').onclick=dlgList;return}
  const st=d.steps[k],os=shuf(st.opts);
  app.innerHTML=`<h2>${d.icon} ${esc(L2(d.title))}</h2><div class="chat">${hist}${line(st.who,'l')}</div><button class="sp sm" id="sp" aria-label="🔊">🔊</button>${os.map((o,j)=>`<button class="opt" data-o="${j}"><span dir="ltr" lang="tr">${esc(o.tr)}</span><small>${B(gl(o))}</small></button>`).join('')}`;
  speak(st.who.tr);$('#sp').onclick=()=>speak(st.who.tr);
  app.querySelectorAll('[data-o]').forEach((b,j)=>b.onclick=()=>{const o=os[j];sfx(o.ok);if(!o.ok){b.classList.add('bad');return toast(T('dlgBad'))}
   b.classList.add('good');hist+=line(st.who,'l')+line(o,'r');k++;setTimeout(step,500)})};
 step()}

function sufExplain(q){const w=q.why,p=[];if(w.vowel)p.push(T('sf_v',w.v,w.vowel));else if(q.suf=='poss')p.push(T('sf_m'));
 if(w.hard)p.push(T('sf_hard',w.hard));if(w.buf)p.push(T('sf_buf',w.buf));if(w.soft)p.push(T('sf_soft',w.soft[0],w.soft[1]));return p.join(' ')}
function suffixes(){const TOT=10;let n=0,ok=0;
 const draw=()=>{if(n>=TOT){S.xp+=ok;save();head();app.innerHTML=`<div class="center"><div class="big">🧩</div><h2>${T('sentRes',ok,TOT)}</h2><p class="mut">+${ok} XP</p></div><button class="btn" id="h">${T('done')}</button>`;$('#h').onclick=home;return}
  const q=TRL.suffixQ();
  app.innerHTML=`<div class="top"><div class="bar"><i style="width:${n/TOT*100}%"></i></div></div><div class="body slide"><div class="q">${T('sufQ')} · ${T('sf_'+q.suf)}</div><div class="tq" dir="ltr" lang="tr">${esc(q.stem)} + <b>${esc(q.why.label)}</b> = ?</div>${q.opts.map(o=>`<button class="opt" data-o="${esc(o)}">${TR(o)}</button>`).join('')}</div>`;
  app.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{if(b.dataset.d)return;app.querySelectorAll('[data-o]').forEach(x=>x.dataset.d=1);const good=b.dataset.o==q.ans;sfx(good);b.classList.add(good?'good':'bad');
   if(!good)app.querySelectorAll('[data-o]').forEach(x=>{if(x.dataset.o==q.ans)x.classList.add('good')});if(good)ok++;n++;
   banner(good,sufExplain(q),(good?pick(T('praise'),1)[0]:T('correctSol'))+' '+q.stem+' + '+q.why.label+' = '+q.ans);$('#nx').onclick=draw})};
 draw()}

function gramList(){setBack(home);app.innerHTML=`<h2>${T('m_gram')}</h2>`+GRAM.map((c,i)=>`<button class="pc row" data-g="${i}"><span>📐</span><div><b>${esc(L2(c.t))}</b><small dir="ltr">${esc(c.ex[0])}</small></div></button>`).join('');
 app.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>gramCard(+b.dataset.g,gramList))}
function gramCard(i,back){const c=GRAM[i];setBack(back);document.body.classList.add('focus');
 app.innerHTML=`<div class="slide"><h2>📐 ${esc(L2(c.t))}</h2><div class="tip">${esc(L2(c.b))}</div>${c.ex.map(e=>`<div class="opt ex" dir="ltr" lang="tr">${esc(e)}</div>`).join('')}</div>`;window.scrollTo&&window.scrollTo(0,0)}

/* ----- placement test: 2 questions per probed unit (every 4th unit); the first failed probe ends it ----- */
function placeOffer(){if($('.place'))return;const d=document.createElement('div');d.className='leave place';
 d.innerHTML=`<div class="lc" role="dialog" aria-modal="true"><div class="big">🧭</div><h2>${T('placeTitle')}</h2><p>${T('placeText')}</p><button class="btn" id="pl-y">${T('placeStart')}</button><button class="btn alt" id="pl-n">${T('placeSkip')}</button></div>`;
 document.body.appendChild(d);S.pl=1;save();$('#pl-n').onclick=()=>d.remove();$('#pl-y').onclick=()=>{d.remove();document.body.classList.add('focus');placement()}}
function maybePlace(){if(S&&S.pl==0&&S.tab=='learn'&&!Object.keys(S.prog).length&&!S.xp)setTimeout(()=>{if(S&&S.pl==0)placeOffer()},400)}
function placement(){document.body.classList.add('focus');const probes=TRL.probeIdx(UNITS.length),res=[];let pi=0,qn=0,hit=0,sel=[],live=true;setBack(()=>{live=false;home()});
 const finish=()=>{const k=TRL.placedUpTo(res);let n=0;for(let i=0;i<=k;i++){const u=UNITS[i];S.prog[u.id]=Math.max(S.prog[u.id]||0,5);ITEMS(u.id).forEach(p=>{if(S.w[p.tr]==null||S.w[p.tr]<6)S.w[p.tr]=6});n++}
  S.pl=1;save();head();if(n)confetti();app.innerHTML=`<div class="center"><div class="big">🧭</div><h2>${T('placeDone',n)}</h2></div><button class="btn" id="h">${T('done')}</button>`;$('#h').onclick=home};
 const draw=()=>{if(!live)return;if(pi>=probes.length)return finish();const u=UNITS[probes[pi]],its=ITEMS(u.id);if(qn==0){sel=pick(its,Math.min(2,its.length));hit=0}
  const q=mkQ('c1',sel[qn],its),os=opts(q);
  app.innerHTML=`<div class="top"><div class="bar"><i style="width:${pi/probes.length*100}%"></i></div></div><div class="body"><div class="q">${q.pr}</div><div class="tq">${q.showH}</div>${os.map((o,i)=>`<button class="opt" data-o="${i}">${B(o)}</button>`).join('')}</div>`;
  speak(q.say);
  app.querySelectorAll('[data-o]').forEach((b,i)=>b.onclick=()=>{if(b.dataset.d)return;app.querySelectorAll('[data-o]').forEach(x=>x.dataset.d=1);const ok=okAns(os[i],q.ans,false);b.classList.add(ok?'good':'bad');sfx(ok);if(ok)hit++;
   setTimeout(()=>{qn++;if(qn>=sel.length){const pass=hit==sel.length;res.push({idx:probes[pi],pass});qn=0;if(!pass)return finish();pi++}draw()},ok?400:700)})};
 draw()}
