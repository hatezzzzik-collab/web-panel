async function api(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({ ok:false, error:'Неверный ответ сервера' }));
  if (!res.ok || !data.ok) throw new Error(data.error || 'Ошибка запроса');
  return data.data || {};
}
function msg(el, text, isError = false) {
  el.textContent = text; el.className = 'message show'; el.style.background = isError ? '#f5f5f5' : '#fff';
}
async function loadMe() {
  try { return await api('/api/me'); } catch { return { authenticated:false, setupRequired:false, user:null }; }
}
