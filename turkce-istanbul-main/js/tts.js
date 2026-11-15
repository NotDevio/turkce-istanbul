/* ===== text-to-speech: ONLY a Turkish (tr-TR) voice is ever used; if the device has none we stay silent instead of reading Turkish with an English voice ===== */
Object.assign(UI.en,{noTrVoice:'No Turkish voice found on this device, so audio is off. Install a Turkish text-to-speech voice (Windows: Settings → Time & language → Speech → Add voices → Turkish; Linux: install speech-dispatcher + espeak-ng; Android: Google Text-to-speech → Turkish).',
 ttsUse:'Turkish voice:',ttsNone:'No Turkish voice installed. Audio is off and listening exercises are skipped.'});
Object.assign(UI.ar,{noTrVoice:'لم يتم العثور على صوت تركي على هذا الجهاز، لذلك تم إيقاف الصوت. ثبّت صوتاً تركياً لتحويل النص إلى كلام (ويندوز: الإعدادات ← الوقت واللغة ← الكلام ← إضافة أصوات ← التركية؛ لينكس: ثبّت speech-dispatcher و espeak-ng؛ أندرويد: Google Text-to-speech ← التركية).',
 ttsUse:'الصوت التركي:',ttsNone:'لا يوجد صوت تركي. الصوت متوقف وتمارين الاستماع متخطاة.'});

const hasTTS=()=>typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined';
const allVoices=()=>{try{return speechSynthesis.getVoices()||[]}catch(e){return[]}};
const isTr=v=>/^tr([-_]|$)/i.test(v.lang||'');
function trVoice(){const vs=allVoices().filter(isTr);if(!vs.length)return null;
 const score=v=>(/neural|natural|online/i.test(v.name)?4:0)+(/google|microsoft|apple|yelda|filiz|tolga|emel|cem|ahmet/i.test(v.name)?2:0)+(v.localService?1:0);
 return vs.slice().sort((a,b)=>score(b)-score(a))[0]}
/* true only when the voice list HAS loaded (not empty) and contains no Turkish voice */
const noTrVoice=()=>window.AndroidApp?!AndroidApp.ttsAvailable():hasTTS()&&allVoices().length>0&&!trVoice();
const canHear=unitId=>!NOLISTEN.has(unitId)&&!noTrVoice();
let _noteShown=false;
function noVoiceNote(){if(_noteShown)return;_noteShown=true;toast(T('noTrVoice'),9000)}
function toast(msg,ms=3500){document.querySelectorAll('.toast').forEach(x=>x.remove());const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),ms)}

function speak(t){if(window.AndroidApp){try{AndroidApp.speak(t)}catch(e){}return}if(!hasTTS())return;
 const go=()=>{const v=trVoice();if(!v)return noVoiceNote();
  try{const u=new SpeechSynthesisUtterance(t);u.voice=v;u.lang=v.lang.replace('_','-');u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}};
 if(allVoices().length)return go();
 let done=false;const f=()=>{if(done)return;done=true;try{speechSynthesis.removeEventListener('voiceschanged',f)}catch(e){}go()};   // voices load asynchronously
 try{speechSynthesis.addEventListener('voiceschanged',f)}catch(e){}setTimeout(f,1500)}
if(hasTTS())try{speechSynthesis.getVoices()}catch(e){}
const ttsInfo=()=>{const e=document.querySelector('#tts');if(!e)return;const v=trVoice();e.textContent=!hasTTS()?'':v?'🔊 '+T('ttsUse')+' '+v.name+' ('+v.lang+')':allVoices().length?'⚠️ '+T('ttsNone'):''};
if(hasTTS())try{speechSynthesis.addEventListener('voiceschanged',ttsInfo)}catch(e){}
