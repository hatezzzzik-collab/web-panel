const btn = document.getElementById('submitBtn'); const message = document.getElementById('message');
btn.onclick = async () => {
  try {
    await api('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ login:document.getElementById('login').value.trim(), password:document.getElementById('password').value }) });
    location.href='/dashboard';
  } catch (error) { msg(message, error.message, true); }
};
