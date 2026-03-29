const logsBox = document.getElementById('logsBox');
const refreshLogsBtn = document.getElementById('refreshLogsBtn');

async function loadLogs() {
  try {
    const res = await fetch('/api/logs?tail=150');
    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Ошибка загрузки логов');
    }

    logsBox.textContent = data.data.logs || 'Логи пусты';
  } catch (error) {
    logsBox.textContent = `Ошибка: ${error.message}`;
  }
}

refreshLogsBtn?.addEventListener('click', loadLogs);

loadLogs();
setInterval(loadLogs, 5000);
