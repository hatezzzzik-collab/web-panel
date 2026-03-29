const authService = require('../services/auth.service');

async function setup(req, res) {
  try {
    const { username, password, token } = req.body;
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Укажи логин и пароль' });
    }
    await authService.registerAdmin(username.trim(), password, token);
    req.session.isAuthenticated = true;
    req.session.username = username.trim();
    res.json({ ok: true, data: { message: 'Администратор создан' } });
  } catch (error) {
    res.status(400).json({ ok: false, error: String(error.message || error) });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const data = await authService.login((username || '').trim(), password || '');
    req.session.isAuthenticated = true;
    req.session.username = data.username;
    res.json({ ok: true, data: { username: data.username } });
  } catch (error) {
    res.status(400).json({ ok: false, error: String(error.message || error) });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.json({ ok: true, data: { message: 'Выход выполнен' } });
  });
}

function me(req, res) {
  res.json({ ok: true, data: { isAuthenticated: !!req.session?.isAuthenticated, username: req.session?.username || '' } });
}

function setupStatus(_req, res) {
  res.json({ ok: true, data: authService.getSetupStatus() });
}

module.exports = { setup, login, logout, me, setupStatus };
