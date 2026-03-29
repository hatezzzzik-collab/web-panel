const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');
const { execCommand } = require('../utils/exec');

const appDir = path.resolve(process.env.APP_DIR || '/opt/web-panel');
const uploadsDir = path.join(appDir, 'uploads');

function ensureUploads() {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function listUploads() {
  ensureUploads();
  return fs.readdirSync(uploadsDir)
    .map((name) => {
      const st = fs.statSync(path.join(uploadsDir, name));
      return { name, size: st.size, modifiedAt: st.mtime.toISOString() };
    })
    .sort((a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime());
}

function clearUploads() {
  ensureUploads();
  for (const n of fs.readdirSync(uploadsDir)) {
    fs.rmSync(path.join(uploadsDir, n), { recursive: true, force: true });
  }
}

async function restartPanel() {
  return await execCommand('pm2 restart web-panel');
}

function validateZipEntry(entryName) {
  const normalized = path.posix.normalize(String(entryName || '').replace(/\\/g, '/'));
  if (!normalized || normalized.startsWith('../') || normalized.includes('/../') || path.isAbsolute(normalized)) {
    throw new Error(`Недопустимый путь в архиве: ${entryName}`);
  }
  return normalized;
}

function applyZipUpdate(filePath) {
  ensureUploads();
  const absoluteFilePath = path.resolve(filePath);
  if (!absoluteFilePath.startsWith(`${uploadsDir}${path.sep}`) && absoluteFilePath !== uploadsDir) {
    throw new Error('Файл обновления должен находиться в папке uploads');
  }
  if (!fs.existsSync(absoluteFilePath)) {
    throw new Error('ZIP-файл не найден');
  }

  const zip = new AdmZip(absoluteFilePath);
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
  if (!entries.length) {
    throw new Error('Архив пустой');
  }

  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'web-panel-update-'));
  try {
    for (const entry of entries) {
      validateZipEntry(entry.entryName);
    }
    zip.extractAllTo(stagingDir, true);

    const keepNames = new Set(['uploads', '.env', '.env.example', 'node_modules']);
    for (const name of fs.readdirSync(appDir)) {
      if (keepNames.has(name)) continue;
      fs.rmSync(path.join(appDir, name), { recursive: true, force: true });
    }

    for (const name of fs.readdirSync(stagingDir)) {
      fs.cpSync(path.join(stagingDir, name), path.join(appDir, name), { recursive: true, force: true });
    }

    return { message: 'Обновление успешно применено' };
  } finally {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
}

module.exports = { ensureUploads, listUploads, clearUploads, restartPanel, applyZipUpdate, uploadsDir, appDir };
