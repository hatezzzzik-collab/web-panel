const bcrypt = require('bcrypt');
const { getAdmin, saveAdmin, getState, saveState } = require('../utils/store');

async function registerAdmin(username, password, token) {
  const admin = getAdmin();
  const state = getState();

  if (admin.created || state.setupUsed) {
    throw new Error('Регистрация уже завершена');
  }
  if (token !== (process.env.SETUP_TOKEN || '')) {
    throw new Error('Неверная ссылка регистрации');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  saveAdmin({ created: true, username, passwordHash });
  saveState({ ...state, setupUsed: true });
  return { username };
}

async function login(username, password) {
  const admin = getAdmin();
  if (!admin.created) {
    throw new Error('Сначала заверши регистрацию по одноразовой ссылке');
  }
  const ok = username === admin.username && await bcrypt.compare(password, admin.passwordHash);
  if (!ok) throw new Error('Неверный логин или пароль');
  return { username: admin.username };
}

function getSetupStatus() {
  const admin = getAdmin();
  const state = getState();
  return { adminCreated: !!admin.created, setupUsed: !!state.setupUsed };
}

module.exports = { registerAdmin, login, getSetupStatus };
