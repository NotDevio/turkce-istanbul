/* Admin page: list accounts, reset a password, delete an account, run a backup. Only users in ADMIN_USERS (or the oldest account) are allowed by the server. */
const $=s=>document.querySelector(s),msg=(t,ok)=>{const m=$('#msg');m.textContent=t||'';m.className=ok?'ok':'err'};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
async function call(m,u,b){try{const r=await fetch(u,{method:m,headers:m=='GET'?{}:{'content-type':'application/json'},body:m=='GET'?undefined:JSON.stringify(b||{}),credentials:'same-origin'});let j={};try{j=await r.json()}catch(e){}return{ok:r.ok,status:r.status,j}}catch(e){return{ok:false,status:0,j:{}}}}
const fd=t=>t?new Date(t).toLocaleString():'—';
async function load(){
 const r=await call('GET','/api/admin/users');
 if(r.status==401){$('#root').innerHTML='<p>Please <a href="./">log in</a> to the app first, then reopen this page.</p>';return}
 if(r.status==403){$('#root').innerHTML='<p class="err">This account is not an admin. Set <code>ADMIN_USERS=yourname</code> on the server.</p>';return}
 if(!r.ok){$('#root').innerHTML='<p class="err">Could not load accounts.</p>';return}
 const us=r.j.users,tot=us.reduce((a,u)=>({xp:a.xp+u.xp,w:a.w+u.words}),{xp:0,w:0});
 $('#root').innerHTML=`<div class="sum"><div><b>${us.length}</b><small>accounts</small></div><div><b>${tot.xp}</b><small>total XP</small></div><div><b>${tot.w}</b><small>words learned</small></div><div><b>${r.j.backups.length}</b><small>daily backups (keep ${r.j.keep})</small></div></div>
 <div class="wrap"><table class="adm"><thead><tr><th>User</th><th>Created</th><th>Last lesson</th><th>🔥</th><th>XP</th><th>Units</th><th>Words</th><th>Devices</th><th>Logins</th><th></th></tr></thead><tbody>${us.map(u=>`<tr><td><b>${esc(u.username)}</b>${u.admin?' 🛠':''}</td><td>${fd(u.created)}</td><td>${esc(u.last||'—')}</td><td>${u.streak}</td><td>${u.xp}</td><td>${u.units}</td><td>${u.words}</td><td>${u.devices}</td><td>${u.sessions}</td><td><button class="btn alt" data-pw="${esc(u.username)}">Reset password</button>${u.admin?'':`<button class="btn red" data-del="${esc(u.username)}">Delete</button>`}</td></tr>`).join('')}</tbody></table></div>
 <h3>Backups</h3><p class="mut">A copy of <code>data/db.json</code> is saved once a day in <code>data/backups</code>.</p><button class="btn" id="bk" style="width:auto;display:inline-block;padding:10px 18px">Back up now</button>
 <div class="wrap"><table class="adm"><tbody>${r.j.backups.map(b=>`<tr><td>${esc(b.name)}</td><td>${Math.round(b.bytes/1024)} KB</td></tr>`).join('')||'<tr><td class="mut">No backups yet</td></tr>'}</tbody></table></div>`;
 document.querySelectorAll('[data-pw]').forEach(b=>b.onclick=async()=>{const n=b.dataset.pw;if(!confirm('Create a temporary password for “'+n+'” and sign them out everywhere?'))return;
  const x=await call('POST','/api/admin/reset-password',{username:n});x.ok?msg('New password for '+x.j.username+': '+x.j.password+'  (tell them to change it in Profile)',true):msg('Failed ('+x.status+')')});
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{const n=b.dataset.del;if(!confirm('Delete “'+n+'” and all their progress? This cannot be undone.'))return;
  const x=await call('POST','/api/admin/delete',{username:n});x.ok?(msg('Deleted '+n,true),load()):msg('Failed ('+x.status+')')});
 $('#bk').onclick=async()=>{const x=await call('POST','/api/admin/backup');x.ok?(msg('Saved '+x.j.name,true),load()):msg('Backup failed')};
}
load();
