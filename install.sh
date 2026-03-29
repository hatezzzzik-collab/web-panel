
#!/bin/bash
# =========================================
# Установка web-panel v6 через GitHub/ZIP
# =========================================
set -e
echo "🖥 Установка web-panel v6"
echo "===================================="

# 1. Устанавливаем зависимости системы
apt update && apt install -y git curl unzip build-essential python3 pkg-config

# 2. Клонируем репозиторий (если git используется)
if [ ! -d "/opt/web-panel" ]; then
    cd /opt
    git clone https://github.com/ТВОЙ_ЮЗЕР/web-panel.git
fi
cd /opt/web-panel

# 3. Настройка .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env создан, установите SESSION_SECRET и SETUP_TOKEN в файле .env"
fi

# 4. Устанавливаем Node.js и PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# 5. Устанавливаем npm-зависимости проекта
npm install

# 6. Запускаем панель
pm2 stop web-panel 2>/dev/null || true
pm2 start server/app.js --name web-panel
pm2 save
pm2 startup systemd -u root --hp /root

echo "===================================="
echo "✅ Web-panel v6 установлена и запущена"
echo "Доступ по адресу: http://$(curl -s ifconfig.me):3000/login"
