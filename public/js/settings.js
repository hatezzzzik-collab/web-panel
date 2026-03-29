const uploadMsg = document.getElementById('uploadMsg');
const serviceMsg = document.getElementById('serviceMsg');
const filesBox = document.getElementById('filesBox');
let lastUploaded = null;

async function loadUploads() {
  try {
    const d = await api('/api/settings/uploads');
    const files = Array.isArray(d.files) ? d.files : [];
    files.sort((a, b) => new Date(a.modifiedAt) - new Date(b.modifiedAt));
    filesBox.innerHTML = files.length
      ? files.map((f) => `<div class="file-item"><strong>${f.name}</strong><br><span class="small">${f.size} bytes · ${new Date(f.modifiedAt).toLocaleString()}</span></div>`).join('')
      : '<div class="small">Файлов пока нет</div>';
    lastUploaded = files.length ? files[files.length - 1].name : null;
  } catch (error) {
    filesBox.innerHTML = `<div class="small">${error.message}</div>`;
  }
}

document.getElementById('uploadBtn').onclick = async () => {
  const input = document.getElementById('zipFile');
  if (!input.files.length) return msg(uploadMsg, 'Выбери ZIP', true);
  const form = new FormData();
  form.append('zip', input.files[0]);
  try {
    const d = await api('/api/settings/upload', { method: 'POST', body: form });
    lastUploaded = d.filename;
    msg(uploadMsg, `ZIP загружен: ${d.filename}`);
    await loadUploads();
  } catch (error) {
    msg(uploadMsg, error.message, true);
  }
};

document.getElementById('applyBtn').onclick = async () => {
  if (!lastUploaded) return msg(uploadMsg, 'Сначала загрузи ZIP', true);
  try {
    const d = await api('/api/settings/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: lastUploaded })
    });
    msg(uploadMsg, d.message || 'Файлы заменены');
  } catch (error) {
    msg(uploadMsg, error.message, true);
  }
};

document.getElementById('restartPanelBtn').onclick = async () => {
  try {
    const data = await api('/api/settings/restart', { method: 'POST' });
    msg(serviceMsg, data.message || 'Панель перезапускается');
  } catch (error) {
    msg(serviceMsg, error.message, true);
  }
};

document.getElementById('clearUploadsBtn').onclick = async () => {
  try {
    await api('/api/settings/uploads', { method: 'DELETE' });
    msg(serviceMsg, 'Старые файлы удалены');
    await loadUploads();
  } catch (error) {
    msg(serviceMsg, error.message, true);
  }
};

loadUploads();
