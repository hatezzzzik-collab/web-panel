const form = document.getElementById('loginForm');
const message = document.getElementById('message');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    message.textContent = data.error || 'Ошибка входа';
    return;
  }
  window.location.href = '/';
});
