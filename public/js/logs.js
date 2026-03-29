const logsBox = document.getElementById('logsBox');
async function loadLogs(){ const r=await fetch('/api/logs?tail=150'); if(r.status===401) return location.href='/login'; const d=await r.json(); logsBox.textContent=(d.data&&d.data.logs)||d.error||'Пусто'; }
document.getElementById('refreshLogsBtn')?.addEventListener('click', loadLogs);
loadLogs(); setInterval(loadLogs,5000);
