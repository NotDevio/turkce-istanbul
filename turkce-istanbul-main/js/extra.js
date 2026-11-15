/* ===== i18n =====
   Add a language: LANGS entry + UI entry here, TRANS.<code>/META.<code> in lessons.js.
   Missing strings or translations fall back to English. */
const LANGS={ar:{n:'العربية',dir:'rtl'},en:{n:'English',dir:'ltr'}};
const UI={
en:{appTitle:'Türkçe İstanbul – Learn Turkish A1–B2',tab_learn:'Learn',tab_prac:'Practice',tab_exam:'Exams',tab_me:'Profile',
lv_A1:'Beginner',lv_A2:'Elementary',lv_B1:'Intermediate',lv_B2:'Upper-intermediate',
section:'Section',stage:'Level',mastery:'Unit exam',words:'Words in this unit',lockedHint:'Pass the previous level with 90% or more',
start:'Start',check:'Check',cont:'Continue',done:'Done',retry:'Try again',back:'Back',cancel:'Cancel',
toBase:'Translate to English',toTr:'Translate to Turkish',typeTr:'Type in Turkish',hear:'Type what you hear',build:'Build in Turkish:',matchQ:'Match the pairs',typePh:'Type in Turkish…',
correctSol:'Correct solution:',praise:['Nicely done!','Great job!','Awesome!','Excellent!','Correct!'],
complete:'Level complete!',noHearts:'Out of hearts',failed:'Not yet',
need:p=>`You need ${p}% accuracy to unlock the next level. Review and try again.`,hearts0:'Review the phrases and try again.',
xpL:'XP earned',acc:'Accuracy',passed:'Passed!',
l_streak:'Day streak',l_xp:'Total XP',l_units:'Units done',l_review:'To review',
learned:'Words you have learned',noWords:'No words yet. Pass a level and its words will appear here.',search:'Search…',mlvl:n=>`Level ${n}`,
switchAcc:'Accounts',lang:'Language',reset:'Reset progress',resetQ:'Reset all progress for this account?',
accounts:'Accounts',newAcc:'New account',name:'Name',pickAv:'Choose an avatar',create:'Create',del:'Delete',delQ:n=>`Delete “${n}” and all of its progress?`,
practice:'Practice',m_flash:'Flashcards',d_flash:'Flip and review',m_match:'Match pairs',d_match:'Beat the clock',m_ws:'Word search',d_ws:'Find hidden words',m_sent:'Sentence builder',d_sent:'Arrange the words',m_rev:'Mistakes',d_rev:n=>`To review: ${n}`,m_dict:'Dictionary',d_dict:n=>`${n} words`,
exams:'Exams',examHint:'Score 70% or more to pass and earn 50 XP.',exam:'Exam',bestS:n=>`Best score: ${n}%`,notTaken:'Not taken yet',
flip:'tap to flip',knew:'I knew it',still:'Still learning',known:(k,n)=>`${k}/${n} known`,
matchT:'Match the pairs',matchRes:(s,e)=>`🎉 ${s}s · ${e} mistakes · +10 XP`,wsT:'Word search',wsHelp:'Tap the letters in order to select a word.',
sentRes:(o,n)=>`${o}/${n} correct`,noMiss:'No mistakes to review',dictT:'Dictionary',dictPh:'Search Turkish or English…'},
ar:{appTitle:'Türkçe İstanbul – تعلّم التركية A1–B2',tab_learn:'تعلّم',tab_prac:'تدرّب',tab_exam:'اختبارات',tab_me:'حسابي',
lv_A1:'مبتدئ',lv_A2:'أساسي',lv_B1:'متوسط',lv_B2:'فوق المتوسط',
section:'القسم',stage:'المرحلة',mastery:'اختبار الوحدة',words:'كلمات هذه الوحدة',lockedHint:'اجتز المرحلة السابقة بدقة 90% أو أكثر',
start:'ابدأ',check:'تحقّق',cont:'متابعة',done:'تم',retry:'حاول مجدداً',back:'رجوع',cancel:'إلغاء',
toBase:'ترجم إلى العربية',toTr:'ترجم إلى التركية',typeTr:'اكتب بالتركية',hear:'اكتب ما تسمعه',build:'ابنِ الجملة بالتركية:',matchQ:'طابق الأزواج',typePh:'اكتب بالتركية…',
correctSol:'الإجابة الصحيحة:',praise:['أحسنت!','عمل رائع!','رائع!','ممتاز!','صحيح!'],
complete:'اكتملت المرحلة!',noHearts:'نفدت القلوب',failed:'ليس بعد',
need:p=>`تحتاج إلى دقة ${p}% لفتح المرحلة التالية. راجع وحاول مجدداً.`,hearts0:'راجع العبارات وحاول مرة أخرى.',
xpL:'النقاط المكتسبة',acc:'الدقة',passed:'نجحت!',
l_streak:'أيام متتالية',l_xp:'مجموع النقاط',l_units:'وحدات مكتملة',l_review:'للمراجعة',
learned:'الكلمات التي تعلمتها',noWords:'لا توجد كلمات بعد. اجتز مرحلة لتظهر كلماتها هنا.',search:'بحث…',mlvl:n=>`المستوى ${n}`,
switchAcc:'الحسابات',lang:'اللغة',reset:'إعادة ضبط التقدم',resetQ:'هل تريد مسح كل تقدم هذا الحساب؟',
accounts:'الحسابات',newAcc:'حساب جديد',name:'الاسم',pickAv:'اختر صورة رمزية',create:'إنشاء',del:'حذف',delQ:n=>`هل تريد حذف «${n}» وكل تقدمه؟`,
practice:'تدرّب',m_flash:'بطاقات تعليمية',d_flash:'اقلب وراجع',m_match:'مطابقة الأزواج',d_match:'سابق الزمن',m_ws:'البحث عن الكلمات',d_ws:'اعثر على الكلمات المخفية',m_sent:'بناء الجمل',d_sent:'رتّب الكلمات',m_rev:'الأخطاء',d_rev:n=>`للمراجعة: ${n}`,m_dict:'القاموس',d_dict:n=>`${n} كلمة`,
exams:'الاختبارات',examHint:'احصل على 70% أو أكثر لتنجح وتكسب 50 نقطة.',exam:'اختبار',bestS:n=>`أفضل نتيجة: ${n}%`,notTaken:'لم يُجرَ بعد',
flip:'اضغط للقلب',knew:'كنت أعرفها',still:'ما زلت أتعلمها',known:(k,n)=>`${k}/${n} معروفة`,
matchT:'طابق الأزواج',matchRes:(s,e)=>`🎉 ${s} ث · ${e} أخطاء · +10 نقاط`,wsT:'البحث عن الكلمات',wsHelp:'اضغط على الحروف بالترتيب لتحديد كلمة.',
sentRes:(o,n)=>`${o}/${n} صحيحة`,noMiss:'لا توجد أخطاء للمراجعة',dictT:'القاموس',dictPh:'ابحث بالتركية أو العربية…'}};

/* ===== data helpers ===== */
const ALL=UNITS.flatMap(u=>u.items.map((p,i)=>({tr:p[0],en:p[1],id:u.id,i,lvl:u.lvl})));
const _I={},ITEMS=id=>_I[id]||(_I[id]=ALL.filter(p=>p.id==id));
const pick=(a,n)=>shuf(a).slice(0,n);
const byTr=t=>ALL.find(p=>p.tr==t);
const bt=p=>p._bt||(S.lang=='en'?p.en:(TRANS[S.lang]&&TRANS[S.lang][p.id]&&TRANS[S.lang][p.id][p.i])||p.en);
const uMeta=(u,k,d)=>(META[S.lang]&&META[S.lang][u.id]&&META[S.lang][u.id][k])||d;
const uTitle=u=>uMeta(u,0,u.title),uTip=u=>uMeta(u,1,u.tip);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const TR=s=>`<span class="tr" lang="tr" dir="ltr">${esc(s)}</span>`;
const B=s=>`<span lang="${LC()}">${esc(s)}</span>`;
const rtl=()=>LANGS[LC()].dir=='rtl';

/* ===== question builders (used by path lessons, exams, review) ===== */
let QID=0;
function mkQ(kind,p,pool){const P0=p;p=pers(p);const b={kind,key:kind+P0.tr,tr:P0.tr,trs:[P0.tr],pool,uid:++QID,need:1};
 if(kind=='c1')return{...b,k:'choice',pr:T('toBase'),showH:TR(p.tr),say:p.tr,dir:'b',ans:bt(p)};
 if(kind=='c2')return{...b,k:'choice',pr:T('toTr'),showH:B(bt(p)),dir:'t',ans:p.tr};
 if(kind=='ty')return{...b,k:'type',pr:T('typeTr'),showH:B(bt(p)),ans:p.tr};
 if(kind=='ls')return{...b,k:'type',pr:T('hear'),say:p.tr,showH:'',ans:p.tr};
 if(kind=='pic'||kind=='bb'||kind=='cc'||kind=='cz'||kind=='sy')return mkQ2(kind,p,pool,b);
 return{...b,k:'build',pr:T('build'),showH:B(bt(p)),ans:p.tr}}
const mQ=(pairs,audio)=>({k:'match',audio:!!audio,kind:'match',key:'m'+pairs.map(p=>p.tr).join('|'),pr:T('matchQ'),pairs:pairs.map(pers),trs:pairs.map(p=>p.tr),tr:pairs[0].tr,uid:++QID,need:1});
function opts(q){if(q.optsList)return shuf(q.optsList);const t=q.dir=='t',f=x=>t?pers(x).tr:bt(pers(x)),bad=[];
 const add=x=>{const v=f(x);if(bad.length<3&&!bad.some(b=>norm(b)==norm(v))&&norm(v)!=norm(q.ans)&&!same(v,q.ans))bad.push(v)};
 shuf(q.pool).forEach(add);if(bad.length<3)shuf(ALL).forEach(add);   // wrong choices come from the SAME unit; other units only if the unit is too small
 return shuf([q.ans,...bad])}
function spread(a){for(let i=1;i<a.length;i++)if(a[i].key==a[i-1].key){const j=a.findIndex((x,k)=>k>i&&x.key!=a[i-1].key&&(!a[i+1]||x.key!=a[i+1].key));if(j>0)[a[i],a[j]]=[a[j],a[i]]}return a}
function uniqPairs(list,n){const r=[];for(const x of list){if(r.length>=n)break;if(r.some(y=>y===x||y.tr==x.tr||same(bt(x),bt(y))||same(x.tr,y.tr)))continue;r.push(x)}return r}
const slice=(u,L)=>{const n=u.items.length;if(L>=5)return u.items.map((_,i)=>i);const a=Math.floor((L-1)*n/4),b=Math.floor(L*n/4);return Array.from({length:b-a},(_,k)=>a+k)};
const sliceObjs=(u,L)=>{const its=ITEMS(u.id);return slice(u,L).map(i=>its[i])};
/* A level (about 10-15 questions): each focus word is asked in a few DIFFERENT exercise types, plus a few earlier / missed words and one pairs exercise */
function levelQs(u,L){if(L>=5)return unitExamQs(u);const its=ITEMS(u.id),focus=sliceObjs(u,L),mast=false,noL=!canHear(u.id),before=mast?[]:its.slice(0,focus[0].i),qs=[],
 per=mast?1:focus.length<=1?5:focus.length<=2?4:focus.length<=3?3:2,
 kindsFor=p=>[...['c2','ty'],...(noL?[]:['ls']),...(p.tr.includes(' ')?['bd']:[]),...newKinds(p)],
 recall=()=>pick(['c1','c2','ty',...(noL?[]:['ls'])],1)[0];
 const used=new Set([...focus,...before].map(x=>x.tr)),
  missed=its.filter(x=>S.miss[x.tr]&&!used.has(x.tr)),rev=pick(missed,2);   // review ONLY words of this unit
 focus.forEach(p=>{const ks=kindsFor(p);
  if(mast)return qs.push(mkQ(pick(ks,1)[0],p,its));
  const first=newKinds(p).includes('pic')&&Math.random()<.6?'pic':'c1';
  [first,...shuf(ks.filter(k=>k!=first))].slice(0,per).forEach(k=>qs.push(mkQ(k,p,its)))});
 pick(before,Math.min(3,before.length)).forEach(p=>qs.push(mkQ(recall(),p,its)));
 rev.forEach(p=>{const q=mkQ(recall(),p,its.concat(rev));q.rev=1;qs.push(q)});
 const mp=uniqPairs([...shuf(focus),...shuf(before),...shuf(its)],4);
 if(mp.length>=4)qs.push(mQ(mp,!noL&&Math.random()<.5));
 return spread(shuf(qs))}
/* End-of-unit exam (stage 5): EVERY word of the unit, 2 questions each (3 for short units), 90% needed to pass and unlock the next unit */
function unitExamQs(u){const its=ITEMS(u.id),n=its.length<=8?3:2,noL=!canHear(u.id),qs=[];
 its.forEach(p=>{const nk=newKinds(p).filter(k=>k!='sy'),ks=[...['c1','c2','ty'],...(noL?[]:['ls']),...(p.tr.includes(' ')?['bd']:[]),...nk],
  first=pick(['c2','ty',...(nk.includes('pic')?['pic']:[])],1)[0];
  [first,...shuf(ks.filter(k=>k!=first))].slice(0,n).forEach(k=>qs.push(mkQ(k,p,its)))});
 return spread(shuf(qs))}
const examQs=items=>spread(shuf(items.flatMap((p,i)=>[mkQ(i%2?'c2':'c1',p,items),mkQ(pick(['ty','ls',...newKinds(p)],1)[0],p,items)])));

/* ===== reusable renderers: sentence builder + match pairs ===== */
function bld(host,ans,cb,o={}){const aw=ans.split(' '),words=aw.concat(o.extra||[]),ord=words.map((_,i)=>i),lg=o.lang||'tr',dr=o.dir||'ltr';let order=shuf(ord),out=[],lock=false;
 for(let t=0;t<6&&order.join()==ord.join();t++)order=shuf(ord);
 const chip=(k,a,v)=>`<button class="opt chip" lang="${lg}" ${a}="${v}">${esc(words[k])}</button>`;
 const draw=()=>{host.innerHTML=`<div class="slot" dir="${dr}">${out.map((k,j)=>chip(k,'data-o',j)).join('')}</div><div class="chips" dir="${dr}">${order.map(k=>out.includes(k)?'':chip(k,'data-k',k)).join('')}</div><div class="sheet"><button class="btn ${out.length?'':'dis'}" id="ck">${T('check')}</button></div>`;
  host.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{if(lock)return;out.push(+b.dataset.k);draw()});
  host.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{if(lock)return;out.splice(+b.dataset.o,1);draw()});
  $('#ck').onclick=()=>{if(!out.length||lock)return;lock=true;const got=out.map(k=>words[k]).join(' '),ok=norm(got)==norm(ans)||(!!o.lang&&same(got,ans));host.querySelectorAll('.slot .chip').forEach(c=>c.classList.add(ok?'good':'bad'));cb(ok)}};
 draw()}
function mtc(host,pairs,cb,audio,onNoListen){const L=shuf(pairs),R=shuf(pairs),dn=new Set();let a=null,ok=0,err=0,au=!!audio;
 const wave=w=>{let h=0;for(const c of w)h=(h*31+c.charCodeAt(0))>>>0;return`<span class="wave" dir="ltr">🔊${Array.from({length:14},(_,i)=>`<i style="height:${6+((h>>(i%9))&7)*3+(i%4)*2}px"></i>`).join('')}</span>`};
 const cell=(s,p,i,h)=>`<button class="opt ${dn.has(p)?'good':''}" ${dn.has(p)?'disabled':''} data-s="${s}" data-i="${i}">${h}</button>`;
 const draw=()=>{a=null;host.innerHTML=`<div class="two">${L.map((p,i)=>cell('l',p,i,au?wave(p.tr):TR(p.tr))+cell('r',R[i],i,B(bt(R[i])))).join('')}</div>${au?`<button class="btn alt" id="nl">${T('cantListen')}</button>`:''}`;
  const nl=host.querySelector('#nl');if(nl)nl.onclick=()=>onNoListen?onNoListen(()=>{au=false;draw()}):(au=false,draw());
  host.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{if(b.disabled)return;const i=+b.dataset.i;
   if(b.dataset.s=='l'){host.querySelectorAll('[data-s=l]').forEach(x=>x.classList.remove('sel'));a=b;b.classList.add('sel');return speak(L[i].tr)}
   if(!a)return;const p=L[+a.dataset.i],r=R[i];
   if(r===p||same(bt(r),bt(p))||same(r.tr,p.tr)){a.disabled=b.disabled=true;a.classList.remove('sel');a.classList.add('good');b.classList.add('good');dn.add(p);dn.add(r);a=null;if(++ok==pairs.length)cb(err==0,err)}
   else{err++;missMark(p._o||p.tr);save();b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),400)}})};
 draw()}

/* ===== practice modes ===== */
const MODES={flash:()=>flash(),match:()=>match(),ws:()=>ws(),sent:()=>sent(),rev:()=>rev(),dict:()=>dict(),exA1:()=>exam('A1'),exA2:()=>exam('A2'),exB1:()=>exam('B1'),exB2:()=>exam('B2')};
function menu(){const L=[['flash','🃏'],['match','🔗'],['ws','🔎'],['sent','🧱'],['rev','🔁'],['dict','📚'],['weak','🎯'],['old','🔄'],['timed','⏱️'],['story','📖'],['dlg','💬'],['suf','🧩'],['dikt','🎧'],['gram','📐'],['place','🧭']],d={rev:Object.keys(S.miss).length,dict:ALL.length,weak:weakWords().length};
 return`<h2>${T('practice')}</h2><div class="pgrid">${L.map(([k,i])=>`<button class="pc" data-m="${k}"><span>${i}</span><b>${T('m_'+k)}</b><small>${T('d_'+k,d[k])}</small></button>`).join('')}</div>`}
function examsView(){return`<h2>${T('exams')}</h2><p class="mut">${T('examHint')}</p>`+['A1','A2','B1','B2'].map(l=>{const b=S.exams['ex'+l]||0;return`<button class="pc row" data-m="ex${l}"><span>📝</span><div><b>${T('exam')} ${l}</b><small>${b?T('bestS',b):T('notTaken')}</small></div>${b>=70?'<em>🏆</em>':''}</button>`}).join('')}
function menuBind(){app.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{document.body.classList.add('focus');setBack(home);MODES[b.dataset.m]()})}
function exam(l){const items=pick(ALL.filter(p=>p.lvl==l),12);
 run({qs:examQs(items),hearts:0,strict:0,exam:1,pass:70,after:home,onEnd:(acc,ok)=>{const k='ex'+l;S.exams[k]=Math.max(S.exams[k]||0,acc);if(!ok)return 0;S.xp+=50;return 50}})}
function rev(){const it=Object.keys(S.miss).map(byTr).filter(Boolean).slice(0,8);
 if(!it.length){app.innerHTML=`<div class="center"><div class="big">✨</div><h2>${T('noMiss')}</h2></div><button class="btn" id="h">${T('done')}</button>`;return $('#h').onclick=home}
 while(it.length<4){const x=pick(ALL,1)[0];if(!it.includes(x))it.push(x)}
 const qs=spread(shuf(it.flatMap(p=>['c1','c2','ty'].map(k=>{const q=mkQ(k,p,it);q.rev=1;return q}))));
 run({qs,hearts:1,strict:0,pass:0,after:home,onEnd:(acc,ok)=>{if(ok)S.xp+=10;return ok?10:0}})}
function flash(){const d=pick(ALL,15);let i=0,known=0,front=true;
 const show=()=>{if(i>=d.length){S.xp+=known;save();head();app.innerHTML=`<div class="center"><div class="big">🃏</div><h2>${T('known',known,d.length)}</h2></div><button class="btn" id="h">${T('done')}</button>`;return $('#h').onclick=home}
  const c=d[i];app.innerHTML=`<div class="top"><div class="bar"><i style="width:${i/d.length*100}%"></i></div></div><button class="card" id="c">${front?TR(c.tr):B(bt(c))}<small>${T('flip')}</small></button>${front?'':`<button class="btn" id="k">${T('knew')}</button><button class="btn alt" id="n">${T('still')}</button>`}`;
  $('#c').onclick=()=>{front=!front;if(!front)speak(c.tr);show()};
  if(!front){$('#k').onclick=()=>{known++;i++;front=true;show()};$('#n').onclick=()=>{S.miss[c.tr]=1;save();i++;front=true;show()}}};show()}
function match(){const d=uniqPairs(shuf(ALL),6),t0=Date.now();
 app.innerHTML=`<h2>🔗 ${T('matchT')}</h2><div id="r"></div><div id="mh"></div>`;
 mtc($('#mh'),d,(ok,err)=>{S.xp+=10;save();head();$('#r').innerHTML=`<div class="fb ok">${T('matchRes',Math.round((Date.now()-t0)/1000),err)}</div>`})}
function ws(){const N=10,pool=ALL.filter(p=>/^\p{L}+$/u.test(p.tr)&&p.tr.length>=4&&p.tr.length<=9),W=uniqPairs(shuf(pool),6).map(p=>({e:bt(p),w:p.tr.toLocaleUpperCase('tr'),f:0,p}));
 const g=Array(N*N).fill(''),A='ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
 W.forEach(o=>{const cs=[...o.w];for(let t=0;t<80;t++){const h=Math.random()<.5,r=Math.random()*(h?N:N-cs.length+1)|0,c=Math.random()*(h?N-cs.length+1:N)|0,idx=cs.map((_,k)=>h?r*N+c+k:(r+k)*N+c);
  if(idx.every((x,k)=>!g[x]||g[x]==cs[k])){idx.forEach((x,k)=>g[x]=cs[k]);o.ok=1;break}}});
 const WW=W.filter(o=>o.ok);for(let i=0;i<N*N;i++)if(!g[i])g[i]=A[Math.random()*A.length|0];
 let sel=[];const found=new Set();
 const draw=()=>{app.innerHTML=`<h2>🔎 ${T('wsT')}</h2><p>${T('wsHelp')}</p><div class="ws" dir="ltr" lang="tr">${g.map((c,i)=>`<button class="${found.has(i)?'good':''} ${sel.includes(i)?'sel':''}" data-i="${i}">${c}</button>`).join('')}</div><div class="tip">${WW.map(o=>`<span style="${o.f?'text-decoration:line-through;':''}">${B(o.e)} (${o.w.length})</span>`).join(' · ')}</div>`;
  app.querySelectorAll('.ws button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;sel=sel.includes(i)?sel.filter(x=>x!=i):[...sel,i];const s=sel.map(x=>g[x]).join(''),m=WW.find(o=>!o.f&&(o.w==s||[...o.w].reverse().join('')==s));
   if(m){m.f=1;sel.forEach(x=>found.add(x));sel=[];speak(m.p.tr);if(WW.every(o=>o.f)){S.xp+=15;save();head()}}else if(sel.length>9)sel=[];draw()})};draw()}
function sent(){const R=pick(ALL.filter(p=>p.tr.split(' ').length>=3),5);let i=0,ok=0;
 const show=()=>{if(i>=R.length){S.xp+=ok*3;save();head();app.innerHTML=`<div class="center"><div class="big">🧱</div><h2>${T('sentRes',ok,R.length)}</h2></div><button class="btn" id="h">${T('done')}</button>`;return $('#h').onclick=home}
  const p=R[i];app.innerHTML=`<div class="q">${T('build')}</div><div class="q" style="color:var(--b);margin-top:0">${B(bt(p))}</div><div id="bh"></div>`;
  bld($('#bh'),p.tr,good=>{if(good){ok++;speak(p.tr)}else{S.miss[p.tr]=1;save()}banner(good,TR(p.tr));setTimeout(()=>{i++;show()},good?800:2200)})};show()}
function dict(){app.innerHTML=`<h2>📚 ${T('dictT')} (${ALL.length})</h2><input id="s" placeholder="${T('dictPh')}"><div id="l"></div>`;
 const f=()=>{const q=norm($('#s').value);$('#l').innerHTML=ALL.filter(p=>!q||norm(p.tr).includes(q)||norm(bt(p)).includes(q)||norm(p.en).includes(q)).map(pers).map(p=>`<button class="opt" data-say="${esc(p.tr)}">🔊 <b>${TR(p.tr)}</b> — ${B(bt(p))} <small>${p.lvl}</small></button>`).join('');bindSay($('#l'))};$('#s').oninput=f;f()}

/* ===== answer matching: synonyms count as correct, in every base language ===== */
// "turkish|turkish=english|english". Anything in the same group counts as correct.
// Items that share the exact same English meaning (and their translations) are grouped automatically.
const SYN=["Hoşça kal|Hoşça kalın|Güle güle|Görüşürüz=Goodbye|See you later|Bye","Merhaba|Selam=Hello|Hi","Teşekkür ederim|Teşekkürler|Sağ ol=Thank you|Thanks","Nasılsınız?|Nasılsın?=How are you?","Memnun oldum|Çok memnun oldum=Nice to meet you","Günaydın|İyi sabahlar=Good morning","Özür dilerim|Üzgünüm|Pardon=I am sorry|Sorry","Affedersiniz|Pardon=Excuse me","Hesap, lütfen|Hesap lütfen=The bill, please","Rica ederim|Bir şey değil=You are welcome","Hoş geldiniz|Hoş geldin=Welcome"].map(s=>s.split('=').map(x=>x.split('|')));
let SM,TS;
function symInit(){if(SM)return;SM={};TS=new Set();const add=(k,g)=>{k=norm(k);(SM[k]=SM[k]||new Set()).add(g)};
 SYN.forEach(([tr,en],i)=>{tr.forEach(x=>{add(x,'m'+i);TS.add(norm(x))});en.forEach(x=>add(x,'m'+i))});
 ALL.forEach(p=>{TS.add(norm(p.tr));const g='e:'+p.en.toLowerCase();add(p.tr,g);add(p.en,g)});
 ALL.forEach(p=>{const gs=[...SM[norm(p.tr)]];Object.keys(TRANS).forEach(l=>{const x=TRANS[l][p.id]&&TRANS[l][p.id][p.i];if(x)gs.forEach(g=>add(x,g))})})}
function same(a,b){symInit();if(norm(a)==norm(b))return true;const A=SM[norm(a)],B2=SM[norm(b)];return!!(A&&B2&&[...A].some(g=>B2.has(g)))}
function okAns(v,ans,typed){if(norm(v)==norm(ans))return true;symInit();if(typed&&!TS.has(norm(v)))return false;return same(v,ans)}
