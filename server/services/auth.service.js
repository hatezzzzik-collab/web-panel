const bcrypt = require('bcrypt');
const { getAdmin, saveAdmin, adminExists } = require('../utils/auth-store');
const { getSetupToken, invalidateSetupToken } = require('../utils/setup-token');

async function registerFirstAdmin(token, login, password) {
  const current = getSetupToken();
  if (!current || token !== current) throw new Error('Неверная одноразовая ссылка');
  if (adminExists()) throw new Error('Администратор уже создан');
  const passwordHash = await bcrypt.hash(password, 10);
  saveAdmin({ login, passwordHash, createdAt: new Date().toISOString() });
  invalidateSetupToken();
}
async function login(login, password) {
  const admin = getAdmin();
  if (!admin) throw new Error('Администратор ещё не создан');
  if (admin.login !== login) throw new Error('Неверный логин или пароль');
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) throw new Error('Неверный логин или пароль');
  return { login: admin.login };
}
module.exports = { registerFirstAdmin, login };
