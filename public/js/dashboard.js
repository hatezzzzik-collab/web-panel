const statusEl = document.getElementById('status');
const ipEl = document.getElementById('ip');
const secretEl = document.getElementById('secret');
const tagEl = document.getElementById('tag');
const linkEl = document.getElementById('link');
const messageEl = document.getElementById('message');

const refreshBtn = document.getElementById('refreshBtn');
const restartBtn = document.getElementById('restartBtn');
const clearTagBtn = document.getElementById('clearTagBtn');
const setTagBtn = document.getElementById('setTagBtn');
const tagInput = document.getElementById('tagInput');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const uninstallBtn = document.getElementById('uninstallBtn');

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.className = isError ? 'message error' : 'message success';
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }

  return data.data;
}

async function loadStatus() {
  try {
    const data = await fetchJson('/api/proxy/status');
    statusEl.textContent = data.status || '-';
    ipEl.textContent = data.ip || '-';
    secretEl.textContent = data.secret || '-';
    tagEl.textContent = data.tag || '-';
    linkEl.textContent = data.link || '-';
  } catch (error) {
    showMessage(error.message, true);
  }
}

refreshBtn?.addEventListener('click', async () => {
  await loadStatus();
  showMessage('Данные обновлены');
});

restartBtn?.addEventListener('click', async () => {
  try {
    const data = await fetchJson('/api/proxy/restart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    showMessage(data.message || 'Прокси перезапущен');
    await loadStatus();
  } catch (error) {
    showMessage(error.message, true);
  }
});

setTagBtn?.addEventListener('click', async () => {
  try {
    const tag = tagInput.value.trim();

    await fetchJson('/api/proxy/tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag })
    });

    showMessage('Tag установлен');
    tagInput.value = '';
    await loadStatus();
  } catch (error) {
    showMessage(error.message, true);
  }
});

clearTagBtn?.addEventListener('click', async () => {
  try {
    const data = await fetchJson('/api/proxy/tag', {
      method: 'DELETE'
    });

    showMessage(data.message || 'Tag удалён');
    await loadStatus();
  } catch (error) {
    showMessage(error.message, true);
  }
});

copyLinkBtn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(linkEl.textContent.trim());
    showMessage('Ссылка скопирована');
  } catch {
    showMessage('Не удалось скопировать ссылку', true);
  }
});

uninstallBtn?.addEventListener('click', async () => {
  const confirmed = confirm('Точно удалить proxy с сервера?');
  if (!confirmed) return;

  try {
    const data = await fetchJson('/api/proxy/uninstall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'YES' })
    });

    showMessage(data.message || 'Proxy удалён');
    await loadStatus();
  } catch (error) {
    showMessage(error.message, true);
  }
});

loadStatus();
