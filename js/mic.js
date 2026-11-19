/* ===== microphone permission: the device/browser asks by itself, on first launch and again before a speaking question if not granted. No custom explanation. ===== */
Object.assign(UI.en,{micNone:'No microphone was found on this device.',micOff:'The microphone is blocked for this app.',micApp:'Speech recognition does not work in this app on your phone, so we will skip the speaking exercises. It works in the Chrome browser.'});
Object.assign(UI.ar,{micNone:'لم يتم العثور على ميكروفون في هذا الجهاز.',micOff:'الميكروفون محظور لهذا التطبيق.',micApp:'التعرّف على الكلام لا يعمل في هذا التطبيق على هاتفك، لذلك سنتخطى تمارين النطق. وهو يعمل في متصفح Chrome.'});
const micSupported=()=>!!(window.AndroidApp||(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.isSecureContext));
async function micState(){if(window.AndroidApp)return AndroidApp.micGranted()?'granted':'prompt';try{if(navigator.permissions&&navigator.permissions.query)return(await navigator.permissions.query({name:'microphone'})).state}catch(e){}return'unknown'}
/* shows the browser's own permission prompt (this is also what makes the app appear in the device's site/app permission settings) */
async function micAsk(){if(!micSupported())return'unsupported';
 if(window.AndroidApp)return new Promise(res=>{window.__micCb=g=>res(g?'granted':'denied');try{AndroidApp.ensureMic()}catch(e){res('error')}});   // Android's own permission dialog
 try{const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop());return'granted'}
 catch(e){const n=e&&e.name;return n=='NotAllowedError'||n=='SecurityError'?'denied':n=='NotFoundError'||n=='OverconstrainedError'?'nomic':'error'}}
async function micEnsure(){return(await micState())=='granted'?'granted':micAsk()}
async function micFirstRun(){let seen=false;try{seen=!!localStorage.getItem('tri_mic_asked')}catch(e){}if(seen)return;
 try{localStorage.setItem('tri_mic_asked','1')}catch(e){}const st=await micState();if(st=='prompt'||st=='unknown')await micAsk()}
