const C='tri-v20',F=['./','index.html','style.css','js/lessons.js','js/units2.js','js/book.js','js/tutor.js','js/extra.js','js/tts.js','js/quiz2.js','js/auth.js','js/notify.js','js/mic.js','js/logic.js','js/content.js','js/more.js','js/app.js','icon.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(F)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||/^\/(api\/|admin\.html|js\/admin\.js|download\.html|js\/download\.js|app\/)/.test(new URL(e.request.url).pathname))return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});

self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(_){}e.waitUntil(self.registration.showNotification(d.title||'Türkçe İstanbul',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||'tri',renotify:true,data:{url:'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l)if('focus'in c)return c.focus();return self.clients.openWindow('./')}))});
