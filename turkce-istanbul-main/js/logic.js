/* ===== pure helpers (no DOM): Turkish suffixes, pronunciation score, spaced repetition, weekly summary, placement.
   Works in the browser (globals) and in Node (tests/more.test.js). ===== */
(function(root){
const V='aeıioöuü',BACK='aıou',HARD='çfhkpsşt',OTHER2={a:'e',e:'a'},F4=['ı','i','u','ü'];
const lastV=w=>[...w].reverse().find(c=>V.includes(c))||'e';
const endsV=w=>V.includes(w.slice(-1));
const two=w=>BACK.includes(lastV(w))?'a':'e';
const four=w=>({a:'ı',ı:'ı',e:'i',i:'i',o:'u',u:'u',ö:'ü',ü:'ü'})[lastV(w)];

/* nouns: soft = the stem used before a vowel (kitap -> kitab-) */
const NOUNS=[{w:'ev'},{w:'el'},{w:'göz'},{w:'kedi'},{w:'masa'},{w:'okul'},{w:'araba'},{w:'çay'},{w:'kapı'},{w:'süt'},{w:'kalem'},{w:'şehir'},{w:'deniz'},{w:'gül'},{w:'kuş'},{w:'vapur'},{w:'çanta'},{w:'park'},{w:'bilet'},{w:'otobüs'},
 {w:'kitap',soft:'kitab'},{w:'çocuk',soft:'çocuğ'},{w:'köpek',soft:'köpeğ'},{w:'ekmek',soft:'ekmeğ'},{w:'sokak',soft:'sokağ'}];
const SUF=['pl','loc','abl','dat','acc','gen','poss'];
const SUFLABEL={pl:'-ler/-lar',loc:'-de/-da',abl:'-den/-dan',dat:'-e/-a',acc:'-i/-ı/-u/-ü',gen:'-in/-ın/-un/-ün',poss:'-im/-ım/-um/-üm'};

function build(n,suf,o={}){
 const w=n.w,t2=o.t2||two(w),f4=o.f4||four(w),ev=endsV(w),hard=o.hard!==undefined?o.hard:HARD.includes(w.slice(-1)),
  buf=o.buf!==undefined?o.buf:ev,base=(o.soft!==undefined?o.soft:true)&&n.soft?n.soft:w,d=hard?'t':'d';
 switch(suf){
  case'pl':return w+(t2=='a'?'lar':'ler');
  case'loc':return w+d+t2;
  case'abl':return w+d+t2+'n';
  case'dat':return base+(buf?'y':'')+t2;
  case'acc':return base+(buf?'y':'')+f4;
  case'gen':return base+(buf?'n':'')+f4+'n';
  case'poss':return base+(buf?'m':f4+'m')}
 return w}
const correct=(n,suf)=>build(n,suf);
function wrongs(n,suf){
 const w=n.w,ev=endsV(w),hard=HARD.includes(w.slice(-1)),t2=two(w),f4=four(w),set=new Set(),ok=build(n,suf),add=o=>{const x=build(n,suf,o);if(x!==ok)set.add(x)};
 if(['pl','loc','abl','dat'].includes(suf))add({t2:OTHER2[t2]});
 if(['acc','gen','poss'].includes(suf))F4.filter(x=>x!==f4).forEach(x=>add({f4:x}));
 if(['loc','abl'].includes(suf))add({hard:!hard});
 if(['dat','acc','gen','poss'].includes(suf)){add({buf:!ev});if(n.soft)add({soft:false})}
 return[...set]}
/* explanation as data; the UI turns it into a sentence in the learner's language */
function why(n,suf){const w=n.w,ev=endsV(w),hard=HARD.includes(w.slice(-1)),v=lastV(w),r={v,front:!BACK.includes(v),vowel:['pl','loc','abl','dat'].includes(suf)?two(w):four(w),
  hard:['loc','abl'].includes(suf)&&hard?w.slice(-1):'',buf:['dat','acc','gen','poss'].includes(suf)&&ev?({dat:'y',acc:'y',gen:'n',poss:''})[suf]:'',
  soft:['dat','acc','gen','poss'].includes(suf)&&n.soft?[w.slice(-1),n.soft.slice(-1)]:null,label:SUFLABEL[suf]};
 if(suf=='poss'&&ev)r.vowel='';return r}
function suffixQ(rnd=Math.random){
 const n=NOUNS[Math.floor(rnd()*NOUNS.length)],suf=SUF[Math.floor(rnd()*SUF.length)],ans=correct(n,suf),bad=wrongs(n,suf).sort(()=>rnd()-.5).slice(0,3);
 const pool=SUF.filter(s=>s!==suf).map(s=>build(n,s)).filter(x=>x!==ans&&!bad.includes(x));
 while(bad.length<3&&pool.length)bad.push(pool.splice(Math.floor(rnd()*pool.length),1)[0]);
 return{n,suf,stem:n.w,ans,opts:[ans,...bad].sort(()=>rnd()-.5),why:why(n,suf)}}

/* ----- pronunciation: which of the target words were recognised ----- */
const fold=s=>String(s).toLocaleLowerCase('tr').replace(/[.,!?'’"؟،]/g,'').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/\s+/g,' ').trim();
function pronScore(heard,target,N){N=N||fold;const h=N(heard).split(' ').filter(Boolean),t=String(target).split(/\s+/).filter(Boolean),pool=[...h];
 const words=t.map(w=>{const i=pool.indexOf(N(w));if(i>=0){pool.splice(i,1);return{w,ok:true}}return{w,ok:false}});
 return{words,pct:words.length?Math.round(100*words.filter(x=>x.ok).length/words.length):0}}

/* ----- spaced repetition: code = dueDay*10 + step; missed words come back after 1, 3, 7 and 14 days ----- */
const SRI=[1,3,7,14];
const srMiss=day=>(day+SRI[0])*10;
const srDue=(code,day)=>Math.floor(code/10)<=day;
function srOk(code,day){if(code==null||!srDue(code,day))return code;const s=code%10+1;return s>=SRI.length?null:(day+SRI[s])*10+s}

/* ----- weekly summary from the daily log { 'YYYY-MM-DD': [xp, sec, correct, answers, newWords] } ----- */
const pad=n=>String(n).padStart(2,'0');
const keyOf=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
function weekSummary(log,now=new Date(),n=7){const days=[];for(let i=n-1;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const k=keyOf(d),a=(log&&log[k])||[0,0,0,0,0];days.push({k,wd:d.getDay(),xp:a[0],sec:a[1],ok:a[2],n:a[3],w:a[4]})}
 const sum=f=>days.reduce((s,x)=>s+x[f],0),nn=sum('n');
 return{days,xp:sum('xp'),min:Math.round(sum('sec')/60),acc:nn?Math.round(100*sum('ok')/nn):0,words:sum('w'),active:days.filter(x=>x.xp>0).length}}

/* ----- placement: units 0..k are skipped, where k is the last probed unit passed before the first failure ----- */
const probeIdx=(count,step=4)=>{const a=[];for(let i=0;i<count;i+=step)a.push(i);return a};
function placedUpTo(results){let k=-1;for(const r of results){if(!r.pass)break;k=r.idx}return k}

const api={V,two,four,lastV,build,NOUNS,SUF,SUFLABEL,suffixQ,correct,wrongs,why,pronScore,SRI,srMiss,srOk,srDue,weekSummary,keyOf,probeIdx,placedUpTo};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else Object.assign(root,{TRL:api});
})(typeof window!=='undefined'?window:globalThis);
