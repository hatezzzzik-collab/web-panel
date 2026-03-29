const fs = require('fs');
const path = require('path');

const dataDir = process.env.DATA_DIR || '/opt/web-panel/data';
const adminFile = path.join(dataDir, 'admin.json');
const stateFile = path.join(dataDir, 'state.json');

function ensureDataFiles() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(adminFile)) {
    fs.writeFileSync(adminFile, JSON.stringify({ created: false, username: '', passwordHash: '' }, null, 2));
  }
  if (!fs.existsSync(stateFile)) {
    fs.writeFileSync(stateFile, JSON.stringify({ setupUsed: false }, null, 2));
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function getAdmin() { return readJson(adminFile); }
function saveAdmin(value) { writeJson(adminFile, value); }
function getState() { return readJson(stateFile); }
function saveState(value) { writeJson(stateFile, value); }

module.exports = {
  ensureDataFiles,
  getAdmin,
  saveAdmin,
  getState,
  saveState,
  adminFile,
  stateFile
};
