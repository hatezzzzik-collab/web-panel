const box=document.getElementById('logsBox');
async function loadLogs(){ try{ const d=await api('/api/logs?tail=150'); box.textContent=d.logs||'Логи пусты'; } catch(error){ box.textContent=error.message; } }
document.getElementById('refreshLogsBtn').onclick=loadLogs; loadLogs();
