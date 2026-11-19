/* ===== extra question types (Duolingo-style) =====
   pic  – "Select the correct image": hear/see a Turkish word, pick the right picture (emoji) among 4
   bb   – "Translate this sentence": Turkish sentence -> build the translation from a word bank (with decoys)
   cc   – "Complete the translation": Turkish sentence with a missing word, pick it from 4 words
   cz   – same, but type the missing word
   (audio matching pairs live in mQ/mtc)  */
Object.assign(UI.en,{examHint:'Every word, 2–3 questions each. Score 90% or more to unlock the next unit.',unitLocked:'Pass the previous unit exam (90%) to unlock this unit.',micErr:'Speech recognition is not available right now. Tap "Can\'t speak now" to skip.',selPic:'Select the correct image',transSent:'Translate this sentence',compTr:'Complete the translation',cantListen:"Can't listen now",cantSpeak:"Can't speak now",
 typoNote:'You have a typo in your answer.',accentNote:'Correct! Watch the Turkish letters:',skip:'Skip',
 skipListenQ:'We will skip the listening exercises in this unit. Are you sure?',skipSpeakQ:'We will skip the speaking exercises. Are you sure?',
 saySent:'Say this sentence',sayWord:'Say this word',tapMic:'Tap the microphone and say it',listening:'Listening…',heard:'We heard:',tryAgain:'Not quite. Try again.',
 noSpeech:"We didn't hear anything. Try again."});
Object.assign(UI.ar,{examHint:'كل كلمات الوحدة، من ٢ إلى ٣ أسئلة لكل كلمة. احصل على ٩٠٪ أو أكثر لفتح الوحدة التالية.',unitLocked:'اجتز اختبار الوحدة السابقة (٩٠٪) لفتح هذه الوحدة.',micErr:'التعرّف على الكلام غير متاح الآن. اضغط «لا أستطيع التحدث الآن» للتخطي.',selPic:'اختر الصورة الصحيحة',transSent:'ترجم هذه الجملة',compTr:'أكمل الترجمة',cantListen:'لا أستطيع الاستماع الآن',cantSpeak:'لا أستطيع التحدث الآن',
 typoNote:'لديك خطأ إملائي في إجابتك.',accentNote:'صحيح! انتبه للأحرف التركية:',skip:'تخطَّ',
 skipListenQ:'سنتخطى تمارين الاستماع في هذه الوحدة. هل أنت متأكد؟',skipSpeakQ:'سنتخطى تمارين التحدث. هل أنت متأكد؟',
 saySent:'قل هذه الجملة',sayWord:'قل هذه الكلمة',tapMic:'اضغط على الميكروفون وانطق',listening:'جارٍ الاستماع…',heard:'سمعنا:',tryAgain:'ليس تماماً. حاول مجدداً.',
 noSpeech:'لم نسمع شيئاً. حاول مجدداً.'});

/* "Benim adım Ali" uses the learner's own name (progress keys keep the original text) */
function pers(p){if(!p||p.tr!=='Benim adım Ali'||typeof S==='undefined'||!S||!S.name)return p;const n=S.name;return{...p,_o:p.tr,tr:'Benim adım '+n,en:'My name is '+n,_bt:String(bt(p)).replace(/Ali|علي/g,()=>n)}}

/* skipped exercise types (listening is skipped per unit for this visit; speaking until reload) */
const NOLISTEN=new Set();let NOSPEAK=false;
const SRC=typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);
const NATIVE=typeof window!=='undefined'&&!!window.AndroidApp;   // inside the Android app: native speech recognition + text-to-speech
const canSay=()=>!!((NATIVE||(SRC&&window.isSecureContext))&&!NOSPEAK);

/* ===== grading typed answers: exact / accent slip / typo / wrong ===== */
const strict=x=>String(x).toLocaleLowerCase('tr').replace(/[.,!?'’؟،]/g,'').replace(/\s+/g,' ').trim();
function osa(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]);for(let j=1;j<=n;j++)d[0][j]=j;
 for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]==b[j-1]?0:1));if(i>1&&j>1&&a[i-1]==b[j-2]&&a[i-2]==b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1)}return d[m][n]}
function grade(v,ans){const typed=String(v);if(strict(typed)==strict(ans))return{ok:1,typed};
 if(norm(typed)==norm(ans))return{ok:1,note:'accent',typed};
 if(okAns(typed,ans,true))return{ok:1,typed};
 const a=norm(ans),b=norm(typed),L=a.length,th=L<=3?0:L<=7?1:2;
 if(th&&Math.abs(a.length-b.length)<=th&&osa(a,b)<=th)return{ok:1,note:'typo',typed};
 return{ok:0,typed}}
/* the correct answer with the letters you got wrong underlined */
function markDiff(typed,right){const a=[...strict(typed)],c=[...right],cl=c.map(x=>x.toLocaleLowerCase('tr')),m=a.length,n=c.length,d=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]);
 for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]==cl[j-1]?0:1));
 const bad=new Set();let i=m,j=n;while(j>0){if(i>0&&d[i][j]==d[i-1][j-1]+(a[i-1]==cl[j-1]?0:1)){if(a[i-1]!=cl[j-1])bad.add(j-1);i--;j--}else if(i>0&&d[i][j]==d[i-1][j]+1)i--;else{bad.add(j-1);j--}}
 return c.map((ch,k)=>bad.has(k)&&/\p{L}/u.test(ch)?`<u>${esc(ch)}</u>`:esc(ch)).join('')}

/* ===== speaking: Web Speech API (Chrome, Edge, Safari; needs https or localhost) ===== */
const NUMW={bir:1,iki:2,üç:3,dört:4,beş:5,on:10,yirmi:20,otuz:30,kırk:40,elli:50,altmış:60,yetmiş:70,seksen:80,doksan:90,yüz:100,bin:1000};
function sayOk(alts,target){const t=norm(target),tw=t.split(' ');
 return alts.some(h=>{const x=norm(h);if(x==t)return true;if(NUMW[target.toLocaleLowerCase('tr')]!=null&&x.replace(/\D/g,'')==String(NUMW[target.toLocaleLowerCase('tr')]))return true;
  if(osa(x,t)<=Math.floor(t.length/5))return true;
  if(tw.length>=3){const hw=new Set(x.split(' '));return tw.filter(w=>hw.has(w)).length/tw.length>=.75}return false})}
function listenTr(cb){if(NATIVE){let f=false;const dn=(e,a)=>{if(!f){f=true;cb(e,a)}};window.__speechDone=(e,j)=>{let a=[];try{a=j?JSON.parse(j):[]}catch(x){}dn(e,a)};
  try{AndroidApp.startListening()}catch(x){dn('error')}return{abort(){f=true;try{AndroidApp.stopListening()}catch(x){}}}}
 let fin=false;const done=(e,a)=>{if(!fin){fin=true;cb(e,a)}};let r;
 try{r=new SRC();r.lang='tr-TR';r.interimResults=false;r.maxAlternatives=5;
  r.onresult=e=>done(null,[...e.results[0]].map(a=>a.transcript));r.onerror=e=>done(e.error||'error');r.onend=()=>done('no-speech');r.start()}catch(e){done('error')}
 return r}

/* small bottom popup: "skip these exercises?" */
function skipSheet(kind,yes){document.querySelectorAll('.skipq').forEach(x=>x.remove());const d=document.createElement('div');d.className='skipq';
 d.innerHTML=`<p>${T(kind=='speak'?'skipSpeakQ':'skipListenQ')}</p><div><button class="btn alt" id="sk-no">${T('cont')}</button><button class="btn" id="sk-yes">${T('skip')}</button></div>`;document.body.appendChild(d);
 $('#sk-no').onclick=()=>d.remove();$('#sk-yes').onclick=()=>{d.remove();yes()}}

/* Turkish word (lowercase) -> picture. Only concrete things; abstract words simply get the other question types. */
const PIC={anne:'👩',baba:'👨',aile:'👨‍👩‍👧',su:'💧',ekmek:'🍞',çay:'🍵',kahve:'☕',peynir:'🧀',okul:'🏫',hastane:'🏥',müze:'🏛️',ilaç:'💊',vapur:'⛴️',bilet:'🎫',tramvay:'🚋',boğaz:'🌉',
 kırmızı:'🔴',mavi:'🔵',yeşil:'🟢',sarı:'🟡',siyah:'⚫',beyaz:'⚪',turuncu:'🟠',mor:'🟣',ilkbahar:'🌸',yaz:'🏖️',sonbahar:'🍂',kış:'⛄',sabah:'🌅',akşam:'🌆',gece:'🌙',
 göz:'👁️',kulak:'👂',burun:'👃',ağız:'👄',el:'✋',ayak:'🦶',kol:'💪',diş:'🦷',ev:'🏠',yatak:'🛏️',banyo:'🛁',kapı:'🚪',pencere:'🪟',sandalye:'🪑',bahçe:'🌷',
 kedi:'🐱',köpek:'🐶',kuş:'🐦',balık:'🐟',at:'🐴',inek:'🐮',tavuk:'🐔',koyun:'🐑',tavşan:'🐰',aslan:'🦁',
 elma:'🍎',muz:'🍌',portakal:'🍊',üzüm:'🍇',domates:'🍅',patates:'🥔',soğan:'🧅',salatalık:'🥒',limon:'🍋',çilek:'🍓',
 güneşli:'☀️',yağmurlu:'🌧️',karlı:'🌨️',rüzgârlı:'💨',bulutlu:'☁️',kar:'❄️',sıcak:'🥵',soğuk:'🥶',
 gömlek:'👔',pantolon:'👖',ceket:'🧥',ayakkabı:'👟',elbise:'👗',şapka:'🧢',çorap:'🧦',gözlük:'👓',
 doktor:'🧑‍⚕️',öğretmen:'🧑‍🏫',mühendis:'👷',polis:'👮',aşçı:'🧑‍🍳',otel:'🏨',pasaport:'🛂',valiz:'🧳',uçak:'✈️',tren:'🚆',telefon:'📱',mesaj:'💬',arkadaş:'🧑‍🤝‍🧑',
 mutlu:'😊',üzgün:'😢',yorgun:'😴',kızgın:'😠',heyecanlı:'🤩',maaş:'💰',üniversite:'🎓',kütüphane:'📚',sınav:'📝',diploma:'📜',bilgisayar:'💻',internet:'🌐',şifre:'🔑',ekran:'🖥️',şarj:'🔋',haber:'📰',
 hasta:'🤒',orman:'🌲',doğa:'🌿',enerji:'⚡',seçim:'🗳️',ayasofya:'🕌',kapalıçarşı:'🛍️',simit:'🥯',bayram:'🎉',fatura:'🧾'};
const picOf=p=>p.tr.includes(' ')?null:PIC[p.tr.toLocaleLowerCase('tr')]||null;
const CHARS=['🧔🏽','👩🏻‍🦰','🐻','🦉','🧑🏾‍🦱','👵'];
const core=t=>t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
const bwords=p=>String(bt(p)).split(' ').filter(Boolean);
const clozeIdx=p=>{const tk=p.tr.split(' ');return tk.length<2?[]:tk.map((t,i)=>i).filter(i=>core(tk[i]).length>=3)};

/* which of the new kinds can be made from this item */
/* every wrong choice / decoy comes from the same unit as the word being asked */
const src=(p,pool)=>[...new Set([...(pool||[]),...ITEMS(p.id)])];
const picOpts=(p,pool)=>{const e=picOf(p),ch=[];shuf(src(p,pool).filter(x=>x!==p&&picOf(x)&&picOf(x)!=e&&!same(bt(x),bt(p)))).forEach(x=>{if(ch.length<3&&!ch.some(y=>picOf(y)==picOf(x)||same(bt(y),bt(x))))ch.push(x)});return ch};
const bbDecoys=(p,pool)=>{const have=new Set(bwords(p).map(norm)),ex=[];shuf(src(p,pool)).forEach(x=>bwords(x).forEach(t=>{if(ex.length<3&&x!==p&&norm(t).length>1&&!have.has(norm(t))&&!ex.some(y=>norm(y)==norm(t)))ex.push(t)}));return ex};
const ccDecoys=(p,pool,c)=>{const ds=[];shuf(src(p,pool).flatMap(x=>x===p?[]:x.tr.split(' ').map(core))).forEach(x=>{if(ds.length<3&&x.length>=3&&(!c||norm(x)!=norm(c))&&!ds.some(y=>norm(y)==norm(x)))ds.push(x)});return ds};
function newKinds(p){const k=[];if(canSay())k.push('sy');if(picOf(p)&&picOpts(p).length>=3)k.push('pic');
 if(clozeIdx(p).length){k.push('cz');if(ccDecoys(p,null).length>=3)k.push('cc')}
 if(p.tr.includes(' ')&&bwords(p).length>=2&&bbDecoys(p).length>=2)k.push('bb');return k}

function mkQ2(kind,p,pool,b){
 if(kind=='pic'){const e=picOf(p),ch=picOpts(p,pool);
  return{...b,k:'pic',pr:T('selPic'),showH:TR(p.tr),say:p.tr,ans:bt(p),pic:e,popts:shuf([p,...ch]).map(x=>({e:picOf(x),l:bt(x),ok:x===p}))}}
 if(kind=='bb'){const ex=bbDecoys(p,pool);
  return{...b,k:'build',pr:T('transSent'),say:p.tr,showH:TR(p.tr),chr:pick(CHARS,1)[0],ans:String(bt(p)),opt:{lang:LC(),dir:LANGS[LC()].dir,extra:ex.slice(0,3)}}}
 if(kind=='sy'){const w=p.tr.includes(' ');return{...b,k:'say',pr:T(w?'saySent':'sayWord'),showH:TR(p.tr),say:p.tr,ans:p.tr,full:p.tr,chr:w?pick(CHARS,1)[0]:undefined}}
 /* cc / cz */
 const tk=p.tr.split(' '),i=pick(clozeIdx(p),1)[0],t=tk[i],c=core(t),pre=t.slice(0,t.indexOf(c)),post=t.slice(t.indexOf(c)+c.length);
 const sen=tk.map((x,j)=>j==i?esc(pre)+'<span class="gap">'+'＿'.repeat(Math.max(3,Math.min(c.length,6)))+'</span>'+esc(post):esc(x)).join(' ');
 const base={...b,pr:T('compTr'),showH:B(bt(p)),chr:pick(CHARS,1)[0],sen,ans:c,full:p.tr};
 if(kind=='cz')return{...base,k:'type'};
 const ds=ccDecoys(p,pool,c);if(ds.length<3)return{...base,k:'type'};
 return{...base,k:'choice',dir:'t',optsList:[c,...ds]}}

/* one extra, varied question for an item (or null when it only suits the classic types) */
const extraQ=(p,pool)=>{const ks=newKinds(p);return ks.length?mkQ(pick(ks,1)[0],p,pool):null};
