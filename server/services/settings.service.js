const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { execCommand } = require('../utils/exec');
const appDir = process.env.APP_DIR || '/opt/web-panel';
const uploadsDir = path.join(appDir, 'uploads');

function ensureUploads(){ fs.mkdirSync(uploadsDir, { recursive: true }); }
function listUploads(){ ensureUploads(); return fs.readdirSync(uploadsDir).map(name => { const st = fs.statSync(path.join(uploadsDir, name)); return { name, size: st.size, modifiedAt: st.mtime.toISOString() }; }); }
function clearUploads(){ ensureUploads(); for(const n of fs.readdirSync(uploadsDir)) fs.rmSync(path.join(uploadsDir, n), { recursive: true, force: true }); }

async function restartPanel(){ return await execCommand('pm2 restart web-panel'); }

function applyZipUpdate(filePath){
  ensureUploads();
  // удаляем все старые файлы, кроме нового zip
  for(const n of fs.readdirSync(appDir)){
    if(n !== path.basename(filePath)){
      const p = path.join(appDir, n);
      if(fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
    }
  }
  // распаковываем новый zip
  new AdmZip(filePath).extractAllTo(appDir, true);
}

module.exports = { ensureUploads, listUploads, clearUploads, restartPanel, applyZipUpdate, uploadsDir };
