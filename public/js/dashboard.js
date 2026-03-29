const $ = (id) => document.getElementById(id);
const els = { status: $('status'), ip: $('ip'), secret: $('secret'), tag: $('tag'), ping: $('ping'), link: $('link'), toast: $('message') };
function toast(text, bad=false){ els.toast.textContent=text; els.toast.className=bad?'toast show bad':'toast show'; setTimeout(()=>els.toast.className='toast',2500); }
async function fetchJson(url, options={}) { const r=await fetch(url, options); if (r.status===401) return location.href='/login'; const d=await r.json(); if(!r.ok||!d.ok) throw new Error(d.error||'Ошибка'); return d.data; }
async function loadStatus(){ try { const d=await fetchJson('/api/proxy/status'); els.status.textContent=d.status||'—'; els.ip.textContent=d.ip||'—'; els.secret.textContent=d.secret||'—'; els.tag.textContent=d.tag||'—'; els.ping.textContent=d.ping||'—'; els.link.textContent=d.link||'—'; } catch(e){ toast(e.message,true);} }
$('refreshBtn')?.addEventListener('click', async()=>{ await loadStatus(); toast('Обновлено'); });
$('restartBtn')?.addEventListener('click', async()=>{ try{ const d=await fetchJson('/api/proxy/restart',{method:'POST',headers:{'Content-Type':'application/json'}}); toast(d.message||'Перезапущено'); await loadStatus(); }catch(e){ toast(e.message,true);} });
$('setTagBtn')?.addEventListener('click', async()=>{ try{ await fetchJson('/api/proxy/tag',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tag:$('tagInput').value.trim()})}); $('tagInput').value=''; toast('Tag сохранён'); await loadStatus(); }catch(e){ toast(e.message,true);} });
$('clearTagBtn')?.addEventListener('click', async()=>{ try{ await fetchJson('/api/proxy/tag',{method:'DELETE'}); toast('Tag удалён'); await loadStatus(); }catch(e){ toast(e.message,true);} });
$('copyLinkBtn')?.addEventListener('click', async()=>{ try{ await navigator.clipboard.writeText(els.link.textContent.trim()); toast('Ссылка скопирована'); }catch{ toast('Не удалось скопировать',true);} });
$('logoutBtn')?.addEventListener('click', async()=>{ await fetch('/api/auth/logout',{method:'POST'}); location.href='/login'; });
loadStatus();
