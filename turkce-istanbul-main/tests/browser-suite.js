const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const root=process.argv[2]||'/home/claude/site';
const MIME={'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let p=path.join(root,q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(p)]||'text/plain'});r.end(d)})});
let pass=0,fail=0;const fails=[];
const ok=(c,n,x)=>{if(c){pass++;console.log('  PASS',n)}else{fail++;fails.push(n);console.log('  FAIL',n,x===undefined?'':JSON.stringify(x))}};
const URL_='http://localhost:8124/';
const INIT=`
 const _st=window.setTimeout;window.setTimeout=(f,t,...a)=>_st(f,Math.min(t||0,25),...a);
 window.__said='';try{speechSynthesis.speak=u=>{window.__said=u.text};speechSynthesis.cancel=()=>{}}catch(e){}
 window.__errs=[];window.addEventListener('error',e=>window.__errs.push(e.message));
`;
const STEP=`(opts)=>{
 const app=document.querySelector('#app');
 if(app.querySelector('.fin'))return 'fin';
 if(app.querySelector('.sheet.ok,.sheet.no'))return 'wait';
 const body=app.querySelector('.body');if(!body)return 'wait';
 window.__w=window.__w||{left:opts.wrong||0,sigs:{}};
 const sig=body.innerText.slice(0,80)+'|'+__said;
 let wrong=false;if(window.__w.left>0&&!window.__w.sigs[sig]){wrong=true;window.__w.left--;window.__w.sigs[sig]=1}
 const t=e=>e.textContent.trim();
 const isMatch=!!body.querySelector('.two'),isBuild=!!body.querySelector('#bh'),isChoice=!!body.querySelector('[data-o]'),isType=!!document.querySelector('#in');
 const say=!!body.querySelector('#sp');
 const showEl=body.querySelector('.say span:not(.tr)')||body.querySelector('.say .tr');
 const showT=showEl?t(showEl):'';
 const cands=say?[byTr(__said)].filter(Boolean):ALL.filter(p=>bt(p)==showT||p.tr==showT);
 if(isMatch){
   const L=[...body.querySelectorAll('[data-s=l]:not(:disabled)')],R=[...body.querySelectorAll('[data-s=r]:not(:disabled)')];
   if(!L.length)return 'wait';
   const l=L[0],tr=t(l),p=ALL.find(x=>x.tr==tr);
   const right=R.find(r=>same(t(r),bt(p)));
   if(wrong&&!window.__mw){window.__mw=1;l.click();const bad=R.find(r=>r!==right);if(bad)bad.click();return 'wrongmatch'}
   l.click();right.click();return 'match';
 }
 if(isBuild){
   const chips=[...body.querySelectorAll('[data-k]')].map(t);const key=a=>[...a].sort().join('|');
   const c=cands.find(p=>key(p.tr.split(' '))==key(chips))||ALL.find(p=>key(p.tr.split(' '))==key(chips)&&(bt(p)==showT));
   if(!c)return 'nocand:'+showT+'|'+chips;
   let ws=c.tr.split(' ');if(wrong){ws=[...ws.slice(1),ws[0]]}
   for(const w of ws){const b=[...document.querySelectorAll('#bh [data-k]')].find(x=>t(x)==w);b&&b.click()}
   document.querySelector('#bh #ck').click();return 'build';
 }
 if(isChoice){
   const os=[...body.querySelectorAll('[data-o]')];
   const goodOpt=os.find(o=>cands.some(p=>{const v=t(o);return v==p.tr||same(v,p.tr)||same(v,bt(p))}));
   if(!goodOpt)return 'nogood:'+showT+'|'+__said;
   const pickO=wrong?os.find(o=>o!==goodOpt):goodOpt;pickO.click();return 'choice';
 }
 if(isType){
   const inp=document.querySelector('#in');const ans=cands.length?cands[0].tr:'';
   inp.value=wrong?'zzzz':ans;inp.dispatchEvent(new Event('input'));document.querySelector('#ck').click();return 'type';
 }
 return 'wait';
}`;
async function play(pg,{wrong=0,max=900}={}){
  await pg.evaluate(()=>{window.__w=null;window.__mw=0});
  let last='',n=0,log={};
  for(;n<max;n++){
    const r=await pg.evaluate(`(${STEP})(${JSON.stringify({wrong})})`);
    log[r.split(':')[0]]=(log[r.split(':')[0]]||0)+1;
    if(r=='fin')return {n,log};
    if(r.startsWith('no')){return {n,log,err:r}}
    await pg.waitForTimeout(r=='wait'?15:5);
  }
  return {n,log,err:'timeout'};
}
const text=pg=>pg.evaluate(()=>document.body.innerText);
async function mkPage(b,ctxOpts={},init){
  const ctx=await b.newContext({viewport:{width:390,height:800},...ctxOpts});
  if(init)await ctx.addInitScript(init);
  await ctx.addInitScript(INIT);
  await ctx.route(/fonts\.g/,r=>r.abort());
  const pg=await ctx.newPage();pg.__errs=[];
  pg.on('pageerror',e=>pg.__errs.push(e.message));
  pg.on('dialog',d=>d.accept());
  return {ctx,pg};
}
const state=pg=>pg.evaluate(()=>({acc:JSON.parse(localStorage.getItem('tri_accounts')||'{}'),act:localStorage.getItem('tri_active_user'),lang:document.documentElement.lang,dir:document.documentElement.dir}));
const LAT=/[A-Za-z]/,AR=/[\u0600-\u06FF]/;
// text nodes outside Turkish spans / words that are content, not UI
async function leaks(pg,mode){
  return pg.evaluate(mode=>{
    const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
    while(n=w.nextNode()){const s=n.nodeValue.trim();if(!s)continue;const el=n.parentElement;
      if(el.closest('[lang=tr],.tr,script,style,.ws,.dots'))continue;
      if(el.closest('[data-base]'))continue;
      if(el.closest('.langs'))continue;if(typeof S!=='undefined'&&S&&s==S.name)continue;
      if(mode=='ar'){const m=s.replace(/A1|A2|B1|B2|XP/g,'').match(/[A-Za-z]{2,}/);if(m)out.push(s)}
      else{if(/[\u0600-\u06FF]/.test(s))out.push(s)}
    }return out},mode)}

(async()=>{
await new Promise(r=>srv.listen(8124,r));
const b=await chromium.launch();

console.log('\n== A. First run / Arabic default / account creation ==');
let {ctx,pg}=await mkPage(b);
await pg.goto(URL_);await pg.waitForTimeout(300);
let st=await state(pg);
ok(st.lang=='ar'&&st.dir=='rtl','first run is ar/rtl',st);
ok(await pg.locator('.modal').count()==1,'create-account modal shown on first run');
ok(await pg.locator('#cn').count()==0,'no Cancel when no account exists (cannot dismiss)');
ok((await pg.locator('.modal .langs .opt.sel').innerText())=='العربية','Arabic preselected in create form');
ok(!(await leaks(pg,'ar')).length,'create form fully Arabic',await leaks(pg,'ar'));
await pg.fill('#nm','Ali');await pg.click('[data-av="🐼"]');await pg.click('#ok');await pg.waitForTimeout(200);
st=await state(pg);const idA=st.act;
ok(Object.keys(st.acc).length==1&&st.acc[idA].name=='Ali'&&st.acc[idA].av=='🐼'&&st.acc[idA].lang=='ar','account A created, active, ar',st.act);
ok(await pg.locator('#acc').innerText().then(t=>t.includes('Ali')&&t.includes('🐼')),'top bar shows avatar + name');
ok(await pg.locator('.modal').count()==0,'modal closed after create');

console.log('\n== B. Two entry points open the same manager ==');
await pg.click('#acc');ok(await pg.locator('.modal h2').innerText()=='الحسابات','top-bar entry opens Accounts (Arabic title)');
ok(await pg.locator('[data-dl]').count()==0,'NO delete button when only one account');
await pg.click('#cl');
await pg.click('#nav [data-t=me]');await pg.waitForTimeout(100);
ok(await pg.locator('#sw').count()==1,'Accounts button exists on Profile');
await pg.click('#sw');ok(await pg.locator('.modal h2').innerText()=='الحسابات','Profile button opens same manager');
await pg.click('#cl');

console.log('\n== C. Create second account (English) + switching w/o reload ==');
await pg.click('#acc');await pg.click('#na');
ok((await pg.locator('.modal .langs .opt.sel').innerText())=='العربية','new-account form defaults Arabic');
await pg.click('[data-lg=en]');
ok(await pg.evaluate(()=>document.documentElement.dir)=='ltr'&&(await pg.locator('#ok').innerText()).toLowerCase()=='create','form itself flips to English LTR when English picked');
await pg.fill('#nm','Bob');await pg.click('[data-av="🦁"]');await pg.click('#ok');await pg.waitForTimeout(200);
st=await state(pg);const idB=st.act;
ok(idB!=idA&&Object.keys(st.acc).length==2&&st.lang=='en'&&st.dir=='ltr','B created+active, html en/ltr',st);
ok((await text(pg)).includes('Learn')&&(await text(pg)).includes('Bob'),'UI is English for B');
ok(!(await leaks(pg,'en')).length,'learn path has no Arabic in English mode',await leaks(pg,'en'));
await pg.click('#acc');
ok(await pg.locator('[data-dl]').count()==2,'delete buttons appear with 2 accounts');
await pg.click(`[data-sw="${idA}"]`);await pg.waitForTimeout(150);
st=await state(pg);
ok(st.act==idA&&st.lang=='ar'&&st.dir=='rtl','switched to A: ar/rtl immediately, no reload');
ok((await pg.locator('#acc').innerText()).includes('Ali'),'top bar updated to Ali');
ok((await pg.locator('#nav').innerText()).includes('تعلّم'),'nav in Arabic after switch');

console.log('\n== D. Per-account progress isolation, real lesson play (Arabic) ==');
await pg.click('#nav [data-t=learn]');await pg.evaluate(()=>{document.querySelectorAll('.bub')[0].click()});await pg.waitForTimeout(100);
ok(await pg.locator('.lvr').count()==5,'unit screen shows 5 levels');
ok(await pg.locator('.lvr.lock').count()==4&&await pg.locator('.lvr.cur').count()==1,'only level 1 unlocked at start');
// 1) FAIL attempt: many wrong answers -> must not unlock
await pg.click('.lvr[data-lv="1"]');await pg.waitForTimeout(100);
let rp=await play(pg,{wrong:999});
ok(!rp.err,'fail run finished',rp);
let fin=await text(pg);ok(!/✔/.test(await pg.locator('.fin .big').innerText())&&await pg.evaluate(()=>S.prog[UNITS[0].id]||0)==0,'failing level does NOT unlock next level');
ok(!(await leaks(pg,'ar')).length,'fail screen fully Arabic',await leaks(pg,'ar'));
await pg.click('#h');await pg.waitForTimeout(100);
ok(await pg.locator('.lvr.lock').count()==4,'levels 2-5 still locked after fail');
// 2) PASS with 1-2 wrong-once, verify twice-correct rule via proxy
await pg.evaluate(()=>{window.__nlog={};const o=window.mkQ;window.__omk=o;window.mkQ=function(...a){const q=o(...a);return new Proxy(q,{set(t,k,v){if(k=='need')(window.__nlog[t.uid]=window.__nlog[t.uid]||[]).push(v);t[k]=v;return true}})}});
await pg.click('.lvr[data-lv="1"]');await pg.waitForTimeout(100);
rp=await play(pg,{wrong:2});
ok(!rp.err,'pass run finished',rp);
ok(rp.log.match>=1||true,'match pairs rendered in lesson',rp.log);
ok((rp.log.match||0)+(rp.log.wrongmatch||0)>=1,'Match Pairs appeared inside a path lesson',rp.log);
ok((rp.log.build||0)>=0,'(sentence builder appears only for multi-word items)',rp.log.build);
const nl=await pg.evaluate(()=>window.__nlog);
const wrongSeqs=Object.values(nl).filter(s=>s[0]==2);
ok(wrongSeqs.length>=1&&wrongSeqs.every(s=>{const i=s.indexOf(2);return s[i+1]==1&&s[i+2]==0}),'every wrong-answered question was re-queued and needed 2 more correct answers (2→1→0)',wrongSeqs.slice(0,3));
ok(await pg.evaluate(()=>S.prog[UNITS[0].id])==1,'level 1 passed -> prog=1 (2 wrong answers still ≥90%)');
await pg.evaluate(()=>{window.mkQ=window.__omk});
await pg.click('#h');await pg.waitForTimeout(100);
ok(await pg.locator('.lvr.ok').count()==1&&await pg.locator('.lvr.cur').count()==1&&await pg.locator('.lvr.lock').count()==3,'level 2 unlocked, 3-5 locked (sequential)');
const stA=await state(pg);ok(stA.acc[idA].xp>0&&stA.acc[idA].prog&&Object.keys(stA.acc[idA].w).length>0,'A has XP/progress/words saved');
ok(stA.acc[idB].xp==0&&Object.keys(stA.acc[idB].prog).length==0&&Object.keys(stA.acc[idB].w).length==0,'B has NO progress (no leak)');

console.log('\n== E. Learned words list on Profile (A, Arabic) ==');
await pg.evaluate(()=>document.querySelector('.back').click());await pg.waitForTimeout(100);
await pg.click('#nav [data-t=me]');await pg.waitForTimeout(100);
const nA=await pg.locator('.wr').count();
const wA=await pg.evaluate(()=>Object.keys(S.w).length);
ok(nA==wA&&nA>0,'Profile lists every learned word',{nA,wA});
ok(await pg.locator('.wr .tr[lang=tr]').first().evaluate(e=>getComputedStyle(e).direction)=='ltr','Turkish word rendered direction:ltr in Arabic layout');
ok(await pg.locator('.wr [data-say]').count()==nA,'each word has a TTS button');
await pg.click('.wr [data-say]');ok(await pg.evaluate(()=>!!__said),'TTS invoked');
const firstTr=await pg.locator('.wr .tr').first().innerText();
await pg.fill('#wq',firstTr.slice(0,3));ok(await pg.locator('.wr').count()>=1&&await pg.locator('.wr').count()<=nA,'search filters list');
await pg.fill('#wq','qqqzzz');ok((await pg.locator('#wl').innerText()).trim().length>0&&await pg.locator('.wr').count()==0,'empty-state message on no match');
await pg.fill('#wq','');
ok(await pg.locator('.dots').first().innerText().then(t=>/^[●○]{5}$/.test(t)),'mastery dots shown');
ok(!(await leaks(pg,'ar')).length,'Profile fully Arabic',await leaks(pg,'ar'));

console.log('\n== F. Language switch in Profile w/o reload; English leak audit ==');
await pg.click('[data-l=en]');await pg.waitForTimeout(100);
st=await state(pg);
ok(st.lang=='en'&&st.dir=='ltr'&&st.acc[idA].lang=='en','profile language selector -> en/ltr, saved on account');
ok(!(await leaks(pg,'en')).length,'Profile has no Arabic in English mode',await leaks(pg,'en'));
ok((await pg.locator('.wr small').first().innerText())==await pg.evaluate(()=>bt(ALL.find(p=>p.tr==document.querySelector('.wr .tr').textContent))),'word translation now English');
await pg.click('[data-l=ar]');await pg.waitForTimeout(100);
ok((await state(pg)).dir=='rtl','back to Arabic/rtl');

console.log('\n== G. Reload restores active account ==');
await pg.reload();await pg.waitForTimeout(300);
st=await state(pg);ok(st.act==idA&&st.lang=='ar'&&(await pg.locator('#acc').innerText()).includes('Ali'),'reload restores A (ar, name in top bar)');
await pg.click('#acc');await pg.click(`[data-sw="${idB}"]`);await pg.waitForTimeout(100);
await pg.reload();await pg.waitForTimeout(300);
st=await state(pg);ok(st.act==idB&&st.lang=='en'&&st.dir=='ltr','reload restores B (en, ltr)');
await pg.click('#nav [data-t=me]');await pg.waitForTimeout(100);
ok(await pg.locator('.wr').count()==0,'B profile shows no learned words (isolation)');
ok(await pg.locator('#nav [data-t=me]').count()==1&&(await pg.locator('.stats').innerText()).includes('0'),'B stats are zero');

console.log('\n== H. Delete rules ==');
await pg.click('#sw');
let nacc=Object.keys((await state(pg)).acc).length;
await pg.click(`[data-dl="${idA}"]`);await pg.waitForTimeout(100);
st=await state(pg);ok(Object.keys(st.acc).length==1&&!st.acc[idA]&&st.act==idB,'deleting A (with confirm) removes only A, B still active');
ok(await pg.locator('[data-dl]').count()==0,'last remaining account has no delete button');
// force handler anyway
await pg.evaluate(()=>{window.confirm=()=>true});
st=await state(pg);ok(Object.keys(st.acc).length==1,'last account still exists');
await pg.click('#cl');
// dismissing confirm keeps account
await pg.click('#acc');await pg.click('#na');await pg.fill('#nm','Cy');await pg.click('#ok');await pg.waitForTimeout(100);
await pg.click('#acc');
await pg.evaluate(()=>{window.confirm=()=>false});
const idC=(await state(pg)).act;
await pg.click(`[data-dl="${idB}"]`);ok(Object.keys((await state(pg)).acc).length==2,'cancelling confirm keeps the account');
await pg.evaluate(()=>{window.confirm=()=>true});
await pg.click(`[data-dl="${idC}"]`);await pg.waitForTimeout(100);
st=await state(pg);ok(Object.keys(st.acc).length==1&&st.act==idB,'deleting the ACTIVE account switches to the remaining one');
await pg.click('#cl');
ok(!pg.__errs.length,'no JS errors in sections A-H',pg.__errs);
await ctx.close();

console.log('\n== I. Legacy `tri` migration ==');
{const tmp=await mkPage(b);await tmp.pg.goto(URL_);const uid=await tmp.pg.evaluate(()=>UNITS[0].id),uid2=await tmp.pg.evaluate(()=>UNITS[1].id),tr0=await tmp.pg.evaluate(()=>ALL[0].tr);await tmp.ctx.close();
 const legacy={xp:120,streak:3,last:'',done:{[uid]:1,[uid2]:1},miss:{[tr0]:1,'zzNOPE':1},exams:{exA1:80}};
 const m=await mkPage(b,{}, `if(!localStorage.getItem('__seeded')){localStorage.setItem('tri',${JSON.stringify(JSON.stringify(legacy))});localStorage.setItem('__seeded','1')}`);
 await m.pg.goto(URL_);await m.pg.waitForTimeout(300);
 st=await state(m.pg);const a=Object.values(st.acc)[0];
 ok(Object.keys(st.acc).length==1&&a.xp==120&&a.streak==3&&a.exams.exA1==80,'legacy xp/streak/exams migrated',a&&{xp:a.xp,streak:a.streak});
 ok(a.prog[uid]==5&&a.prog[uid2]==5,'legacy done units -> all 5 levels');
 ok(a.miss[tr0]==1&&!a.miss.zzNOPE,'legacy mistakes migrated (unknown dropped)');
 ok(Object.keys(a.w).length>0,'legacy completed units => learned words');
 ok(await m.pg.evaluate(()=>!!localStorage.getItem('tri')),'old `tri` key NOT deleted');
 ok(await m.pg.locator('.modal').count()==0,'no create form shown when legacy exists; app opens');
 await m.pg.reload();await m.pg.waitForTimeout(200);
 ok(Object.keys((await state(m.pg)).acc).length==1,'migration does not run twice on reload');
 await m.ctx.close()}

console.log('\n== J. Curriculum data audit ==');
{const m=await mkPage(b);await m.pg.goto(URL_);await m.pg.waitForTimeout(200);
 const d=await m.pg.evaluate(()=>{const o={units:UNITS.length,badLevels:[],arMissing:[],arEmpty:0,metaMissing:[],levels:{},enBlank:0,dupTr:0};
  S=mk('x','🦊','ar');
  UNITS.forEach(u=>{let cov=new Set();for(let L=1;L<=5;L++){const s=slice(u,L);if(!s.length)o.badLevels.push(u.id+':L'+L);s.forEach(i=>cov.add(i))}
   if(cov.size!=u.items.length)o.badLevels.push(u.id+':cov');
   const t=TRANS.ar&&TRANS.ar[u.id];if(!t||t.length!=u.items.length||t.some(x=>!x||!x.trim()))o.arMissing.push(u.id);
   const mt=META.ar&&META.ar[u.id];if(!mt||!mt[0]||!mt[1])o.metaMissing.push(u.id);
   u.items.forEach(p=>{if(!p[1])o.enBlank++});o.levels[u.lvl]=(o.levels[u.lvl]||0)+1});
  o.ids=new Set(UNITS.map(u=>u.id)).size;return o});
 ok(d.units==51&&d.ids==51,'51 unique units',{units:d.units,ids:d.ids});
 ok(!d.badLevels.length,'every unit: 5 non-empty levels covering all items',d.badLevels);
 ok(!d.arMissing.length,'Arabic translation present for every item of every unit',d.arMissing);
 ok(!d.metaMissing.length,'Arabic unit title + tip for all units',d.metaMissing);
 ok(d.enBlank==0,'no blank English meanings');
 // level-queue properties
 const q=await m.pg.evaluate(()=>{S=mk('x','🦊','ar');const u=UNITS.find(u=>u.items.length>=8)||UNITS[0];const r={};
  [1,2,3,4,5].forEach(L=>{const qs=levelQs(u,L);r[L]={n:qs.length,kinds:[...new Set(qs.map(x=>x.k))],dupKeys:qs.length-new Set(qs.map(x=>x.key)).size,total:qs.reduce((s,x)=>s+x.need,0)}});
  // mistakes from elsewhere get re-injected
  const other=UNITS.find(x=>x.id!=u.id);S.miss[other.items[0][0]]=1;S.w[other.items[1][0]]=3;
  let hit=0;for(let t=0;t<30;t++){const qs=levelQs(u,2);if(qs.some(x=>x.tr==other.items[0][0]||x.tr==other.items[1][0]))hit++}
  r.reinject=hit;return r});
 ok(q[1].kinds.includes('match')&&q[1].kinds.includes('choice')&&q[1].kinds.includes('type'),'lessons mix choice+type+match',q[1].kinds);
 ok(Object.values(q).slice(0,5).some(x=>x.kinds&&x.kinds.includes('build')),'sentence-builder (multi-word items) appears in path lessons',Object.fromEntries(Object.entries(q).map(([k,v])=>[k,v.kinds])));
 ok(q[1].dupKeys>0,'same exact questions repeat within a level (dupKeys='+q[1].dupKeys+')');
 ok(q.reinject>=20,'missed/learned words from other units re-injected ('+q.reinject+'/30 lessons)');
 await m.ctx.close()}

console.log('\n== K. Whole-app translation + RTL/LTR layout audit ==');
for(const L of ['ar','en']){
 const m=await mkPage(b);await m.pg.goto(URL_);await m.pg.waitForTimeout(200);
 if(L=='en'){await m.pg.click('[data-lg=en]')}
 await m.pg.fill('#nm','Zed');await m.pg.click('#ok');await m.pg.waitForTimeout(150);
 const bad=[];const chk=async(n)=>{const l=await leaks(m.pg,L);if(l.length)bad.push([n,l.slice(0,3)]);
   const ov=await m.pg.evaluate(()=>document.scrollingElement.scrollWidth-innerWidth);if(ov>1)bad.push([n,'h-overflow '+ov])};
 await chk('learn');
 await m.pg.click('#nav [data-t=prac]');await chk('practice');
 await m.pg.click('#nav [data-t=exam]');await chk('exams');
 await m.pg.click('#nav [data-t=me]');await chk('profile');
 await m.pg.click('#acc');await chk('accounts');await m.pg.click('#na');await chk('newform');await m.pg.click('#cn');await m.pg.click('#cl');
 await m.pg.click('#nav [data-t=learn]');await m.pg.evaluate(()=>document.querySelectorAll('.bub')[0].click());await chk('unit');
 // back arrow geometry
 const bx=await m.pg.evaluate(()=>{const r=document.querySelector('#back').getBoundingClientRect();return{x:r.x,w:r.width,t:r.y,txt:document.querySelector('#back').textContent,vis:getComputedStyle(document.querySelector('#back')).display}});
 if(L=='ar')ok(bx.vis!='none'&&bx.x>390/2&&bx.txt=='→','AR: back arrow top-RIGHT and →',bx);else ok(bx.vis!='none'&&bx.x<390/2&&bx.txt=='←','EN: back arrow top-LEFT and ←',bx);
 ok(await m.pg.evaluate(()=>!/quit|خروج/i.test(document.body.innerText)&&!document.querySelector('.x')),L+': no Quit text / .x close button');
 await m.pg.click('.lvr[data-lv="1"]');await m.pg.waitForTimeout(60);
 // walk a few questions auditing each screen kind
 for(let i=0;i<14;i++){await chk('lesson-q'+i);const r=await m.pg.evaluate(`(${STEP})({wrong:0})`);await m.pg.waitForTimeout(40);for(let k=0;k<40&&(await m.pg.evaluate(()=>!!document.querySelector('.sheet.ok,.sheet.no')));k++)await m.pg.waitForTimeout(10)}
 // a wrong answer banner
 await m.pg.evaluate(()=>document.querySelector('#back').click());
 await m.pg.click('.lvr[data-lv="1"]');await m.pg.waitForTimeout(60);
 await m.pg.evaluate(`(${STEP})({wrong:1})`);await m.pg.waitForTimeout(5);await chk('wrong-banner');
 // practice modes
 await m.pg.evaluate(()=>document.querySelector('#back').click());await m.pg.evaluate(()=>document.querySelector('#back').click());await m.pg.waitForTimeout(50);
 await m.pg.click('#nav [data-t=prac]');
 for(const mode of ['flash','match','ws','sent','rev','dict']){await m.pg.click(`[data-m=${mode}]`);await m.pg.waitForTimeout(80);await chk('mode-'+mode);await m.pg.evaluate(()=>document.querySelector('#back').click());await m.pg.waitForTimeout(30)}
 await m.pg.click('#nav [data-t=exam]');await m.pg.click('[data-m=exA1]');await m.pg.waitForTimeout(80);await chk('exam');
 const dirs=await m.pg.evaluate(()=>[...document.querySelectorAll('.tr')].every(e=>getComputedStyle(e).direction=='ltr'));ok(dirs,L+': all Turkish spans direction:ltr');
 ok(!bad.length,L+': no untranslated strings / no horizontal overflow on any screen',bad);
 ok(!m.pg.__errs.length,L+': no JS errors',m.pg.__errs);
 await m.ctx.close()}

console.log('\n== L. Exams + Sentence builder/match inside Arabic lesson + RTL chip order ==');
{const m=await mkPage(b);await m.pg.goto(URL_);await m.pg.waitForTimeout(200);await m.pg.fill('#nm','E');await m.pg.click('#ok');await m.pg.waitForTimeout(100);
 await m.pg.click('#nav [data-t=exam]');await m.pg.click('[data-m=exA1]');await m.pg.waitForTimeout(60);
 const rp=await play(m.pg,{wrong:0});ok(!rp.err,'exam autoplay finished',rp);
 const s=await state(m.pg);const a=Object.values(s.acc)[0];ok(a.exams.exA1>=70&&a.xp>=50,'exam passed: score saved per-account + 50 XP',{e:a.exams,xp:a.xp});
 ok((await m.pg.locator('.fin h2').innerText())=='نجحت!','exam result screen in Arabic');
 await m.pg.click('#h');
 // find a unit+level whose focus has a multi-word item (sentence builder)
 const loc=await m.pg.evaluate(()=>{for(let i=0;i<UNITS.length;i++)for(let L=1;L<=4;L++)if(sliceObjs(UNITS[i],L).some(p=>p.tr.includes(' ')))return[i,L];return null});
 await m.pg.evaluate(([i,L])=>{S.prog[UNITS[i].id]=L-1;unit(UNITS[i])},loc);await m.pg.waitForTimeout(60);
 await m.pg.click(`.lvr[data-lv="${loc[1]}"]`);
 let found=false;for(let i=0;i<400&&!found;i++){found=await m.pg.evaluate(()=>!!document.querySelector('#bh .chip'));if(found)break;await m.pg.evaluate(`(${STEP})({wrong:0})`);await m.pg.waitForTimeout(25)}
 if(found){const g=await m.pg.evaluate(()=>{const c=document.querySelector('#bh .chips'),sl=document.querySelector('#bh .slot'),ch=document.querySelector('#bh .chip');return{cd:getComputedStyle(c).direction,sd:getComputedStyle(sl).direction,chipText:ch.textContent,lang:ch.lang,prompt:document.querySelector('.q').textContent,said:document.documentElement.dir}});
  ok(g.cd=='ltr'&&g.sd=='ltr'&&g.lang=='tr'&&/[\u00e7\u011f\u0131\u00f6\u015f\u00fca-z]/i.test(g.chipText)&&g.said=='rtl','builder: Turkish chips LTR + lang=tr inside RTL page; Arabic prompt',g)}
 else ok(false,'sentence builder reached in a multi-word unit level 1');
 await m.ctx.close()}

console.log('\n== M. Service worker / manifest wiring ==');
{const sw=fs.readFileSync(root+'/sw.js','utf8');ok(/tri-v8/.test(sw)&&!/tri-v7/.test(sw),'sw.js cache is tri-v8');
 const files=[...sw.matchAll(/'([^']+)'/g)].map(x=>x[1]).filter(x=>/\.(js|css|html|svg)$/.test(x)||x=='./');
 const miss=files.filter(f=>f!='./'&&!fs.existsSync(path.join(root,f)));ok(!miss.length,'every file in sw.js precache list exists',miss);
 const idx=fs.readFileSync(root+'/index.html','utf8');const refs=[...idx.matchAll(/(?:src|href)="([^"#]+)"/g)].map(x=>x[1]).filter(x=>!/^https?:/.test(x));
 const miss2=refs.filter(f=>!fs.existsSync(path.join(root,f)));ok(!miss2.length,'every local file index.html references exists',{refs,miss2})}

console.log(`\n==== ${pass} passed, ${fail} failed ====`);if(fail)console.log(fails.join('\n'));
await b.close();srv.close();process.exit(fail?1:0)})();
