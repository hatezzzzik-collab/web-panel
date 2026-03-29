const form = document.getElementById('setupForm');
const message = document.getElementById('message');
const token = window.location.pathname.split('/').pop();
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const res = await fetch('/api/auth/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, token }) });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    message.textContent = data.error || 'Ошибка регистрации';
    return;
  }
  window.location.href = '/';
});
