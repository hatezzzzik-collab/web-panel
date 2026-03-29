const fs = require('fs');
const path = require('path');
const { adminExists } = require('./auth-store');
const tokenFile = path.join(__dirname, '..', 'data', 'setup-token.txt');
function getSetupToken() {
  if (adminExists()) return null;
  if (fs.existsSync(tokenFile)) return fs.readFileSync(tokenFile, 'utf8').trim() || null;
  return process.env.SETUP_TOKEN || null;
}
function invalidateSetupToken() { if (fs.existsSync(tokenFile)) fs.rmSync(tokenFile, { force: true }); }
module.exports = { getSetupToken, invalidateSetupToken };
