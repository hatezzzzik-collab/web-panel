const path = require('path');
const { adminExists } = require('../utils/auth-store');
const { getSetupToken } = require('../utils/setup-token');
const authService = require('../services/auth.service');

function openSetupPage(req, res) {
  const token = req.params.token;
  const current = getSetupToken();
  if (!current || token !== current) return res.status(404).send('Setup link is invalid');
  return res.sendFile(path.join(__dirname, '..', '..', 'public', 'setup.html'));
}
async function registerFirstAdmin(req, res) {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ ok: false, error: 'Укажи логин и пароль' });
    await authService.registerFirstAdmin(req.params.token, login, password);
    req.session.user = { login };
    res.json({ ok: true });
  } catch (error) { res.status(400).json({ ok: false, error: String(error.message || error) }); }
}
function openLoginPage(_req, res) { return res.sendFile(path.join(__dirname, '..', '..', 'public', 'login.html')); }
async function login(req, res) {
  try {
    const user = await authService.login(req.body.login, req.body.password);
    req.session.user = user;
    res.json({ ok: true, data: user });
  } catch (error) { res.status(400).json({ ok: false, error: String(error.message || error) }); }
}
function logout(req, res) { req.session.destroy(() => res.json({ ok: true })); }
function me(req, res) { res.json({ ok: true, data: { authenticated: !!req.session.user, setupRequired: !adminExists(), user: req.session.user || null } }); }
module.exports = { openSetupPage, registerFirstAdmin, openLoginPage, login, logout, me };
