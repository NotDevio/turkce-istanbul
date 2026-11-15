/* download page: show the button only if the server really has the APK */
(async()=>{const $=s=>document.querySelector(s);
 try{const r=await fetch('app/latest.apk',{method:'HEAD'});if(!r.ok)throw 0;$('#dl').hidden=false}catch(e){$('#none').hidden=false}
 try{const j=await (await fetch('app/version.json')).json();$('#ver').textContent='Version '+j.versionName+(j.notes?' – '+j.notes:'')}catch(e){}})();
