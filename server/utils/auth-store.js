const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', 'data');
const adminFile = path.join(dataDir, 'admin.json');
function ensureDir() { fs.mkdirSync(dataDir, { recursive: true }); }
function getAdmin() { ensureDir(); if (!fs.existsSync(adminFile)) return null; return JSON.parse(fs.readFileSync(adminFile, 'utf8')); }
function saveAdmin(admin) { ensureDir(); fs.writeFileSync(adminFile, JSON.stringify(admin, null, 2)); }
function adminExists() { return !!getAdmin(); }
module.exports = { getAdmin, saveAdmin, adminExists };
