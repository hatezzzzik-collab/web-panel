
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { execSync } = require('child_process');

const appDir = '/opt/web-panel';
const newDir = '/opt/web-panel_new';
const backupDir = '/opt/web-panel_backup';

function applyZipUpdate(zipPath){
  // 1. Очистка временной папки
  fs.rmSync(newDir, { recursive: true, force: true });
  fs.mkdirSync(newDir, { recursive: true });

  // 2. Распаковка ZIP
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(newDir, true);

  // 3. Выравнивание лишней верхней папки, если есть
  const items = fs.readdirSync(newDir);
  if(items.length === 1 && fs.statSync(path.join(newDir, items[0])).isDirectory()){
    const inner = path.join(newDir, items[0]);
    fs.readdirSync(inner).forEach(f => {
      fs.renameSync(path.join(inner, f), path.join(newDir, f));
    });
    fs.rmSync(inner, { recursive: true, force: true });
  }

  // 4. Проверка
  if(!fs.existsSync(path.join(newDir, 'server/app.js'))){
    throw new Error('❌ Неверный ZIP: нет server/app.js');
  }

  // 5. Установка зависимостей
  execSync('npm install', { cwd: newDir, stdio: 'inherit' });

  // 6. Backup старой панели
  fs.rmSync(backupDir, { recursive: true, force: true });
  fs.renameSync(appDir, backupDir);

  // 7. Перенос новой панели
  fs.renameSync(newDir, appDir);

  // 8. Рестарт PM2
  execSync('pm2 restart web-panel');
}
module.exports = { applyZipUpdate };
