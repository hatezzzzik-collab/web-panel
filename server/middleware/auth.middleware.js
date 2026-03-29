const { ensureDataFiles, getAdmin, getState } = require('../utils/store');

function isAuthenticated(req, res, next) {
  if (req.session && req.session.isAuthenticated) return next();
  return res.status(401).json({ ok: false, error: 'Требуется вход' });
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.isAuthenticated) return res.redirect('/');
  next();
}

function isSetupAllowed(req, res, next) {
  ensureDataFiles();
  const admin = getAdmin();
  const state = getState();
  const token = req.params.token;

  if (admin.created || state.setupUsed) {
    return res.status(403).send('Ссылка регистрации больше не активна');
  }
  if (token !== (process.env.SETUP_TOKEN || '')) {
    return res.status(403).send('Неверная или устаревшая ссылка');
  }
  next();
}

module.exports = { ensureDataFiles, isAuthenticated, isSetupAllowed, redirectIfAuthenticated };
