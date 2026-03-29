(async () => {
  const me = await loadMe();
  if (!me.authenticated) {
    if (location.pathname !== '/login' && !location.pathname.startsWith('/setup/')) location.href = '/login';
    return;
  }
  const box = document.getElementById('userBox');
  if (box && me.user) box.textContent = `Админ: ${me.user.login}`;
  const btn = document.getElementById('logoutBtn');
  if (btn) btn.onclick = async () => { await fetch('/api/logout', { method:'POST' }); location.href = '/login'; };
})();
