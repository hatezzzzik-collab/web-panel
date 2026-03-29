const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { execCommand } = require('../utils/exec');
const appDir = process.env.APP_DIR || '/opt/web-panel';
const uploadsDir = path.join(appDir, 'uploads');
function ensureUploads(){ fs.mkdirSync(uploadsDir, { recursive: true }); }
function listUploads(){ ensureUploads(); return fs.readdirSync(uploadsDir).map(name => { const st = fs.statSync(path.join(uploadsDir, name)); return { name, size: st.size, modifiedAt: st.mtime.toISOString() }; }); }
function clearUploads(){ ensureUploads(); for (const n of fs.readdirSync(uploadsDir)) fs.rmSync(path.join(uploadsDir, n), { recursive: true, force: true }); }
async function restartPanel(){ return await execCommand('pm2 restart web-panel'); }
function applyZipUpdate(filePath){
  ensureUploads();
  const extractDir = path.join(uploadsDir, `extract-${Date.now()}`);
  fs.mkdirSync(extractDir, { recursive: true });
  new AdmZip(filePath).extractAllTo(extractDir, true);
  let sourceRoot = extractDir;
  const entries = fs.readdirSync(extractDir);
  if (entries.length === 1) { const maybe = path.join(extractDir, entries[0]); if (fs.statSync(maybe).isDirectory()) sourceRoot = maybe; }
  for (const name of ['server','public','package.json','README.md','.env.example']) {
    const src = path.join(sourceRoot, name), dst = path.join(appDir, name);
    if (fs.existsSync(src)) { fs.rmSync(dst, { recursive: true, force: true }); fs.cpSync(src, dst, { recursive: true }); }
  }
}
module.exports = { ensureUploads, listUploads, clearUploads, restartPanel, applyZipUpdate, uploadsDir };
