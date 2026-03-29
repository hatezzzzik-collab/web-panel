#!/bin/bash
set -euo pipefail
APP_NAME="web-panel"
APP_DIR="/opt/web-panel"
REPO_URL="https://github.com/hatezzzzik-collab/web-panel.git"
BRANCH="main"
PORT="3000"
PROXY_BIN="/usr/local/bin/proxy"
CONTAINER_NAME="mtproxy"
log(){ echo -e "$*"; } ; ok(){ echo -e "   ✅ $*"; } ; warn(){ echo -e "   ⚠️  $*"; } ; err(){ echo -e "   ❌ $*"; } ; die(){ err "$*"; exit 1; }
need_root(){ [[ "${EUID}" -eq 0 ]] || die "Запусти от root"; }
cmd_exists(){ command -v "$1" >/dev/null 2>&1; }
randhex(){ if cmd_exists openssl; then openssl rand -hex 24; else head -c 24 /dev/urandom | xxd -ps -c 256; fi; }
get_ip(){ curl -4 -fsS ifconfig.me 2>/dev/null || curl -4 -fsS icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}'; }
install_base_packages(){ apt-get update -qq; apt-get install -y -qq curl ca-certificates gnupg git unzip build-essential python3 pkg-config >/dev/null 2>&1; ok "Базовые зависимости установлены"; }
install_nodejs(){ if cmd_exists node && cmd_exists npm; then ok "Node.js уже установлен: $(node -v), npm: $(npm -v)"; return; fi; curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1; apt-get install -y -qq nodejs >/dev/null 2>&1; ok "Node.js установлен: $(node -v)"; ok "npm установлен: $(npm -v)"; }
install_pm2(){ if cmd_exists pm2; then ok "PM2 уже установлен"; else npm install -g pm2 >/dev/null 2>&1; ok "PM2 установлен"; fi; }
download_or_update_project(){ if [[ -d "$APP_DIR/.git" ]]; then git -C "$APP_DIR" fetch origin "$BRANCH" >/dev/null 2>&1; git -C "$APP_DIR" checkout "$BRANCH" >/dev/null 2>&1; git -C "$APP_DIR" reset --hard "origin/$BRANCH" >/dev/null 2>&1; ok "Проект обновлён"; else rm -rf "$APP_DIR"; git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR" >/dev/null 2>&1 || die "Не удалось скачать проект"; ok "Проект скачан"; fi; }
check_project_files(){ [[ -f "$APP_DIR/package.json" ]] || die "Не найден package.json"; [[ -f "$APP_DIR/server/app.js" ]] || die "Не найден server/app.js"; [[ -d "$APP_DIR/public" ]] || die "Не найдена public"; ok "Структура проекта корректна"; }
write_env(){ local setup_token session_secret; setup_token="$(randhex)"; session_secret="$(randhex)"; cat > "$APP_DIR/.env" <<EOF
PORT=${PORT}
PROXY_BIN=${PROXY_BIN}
CONTAINER_NAME=${CONTAINER_NAME}
SESSION_SECRET=${session_secret}
SETUP_TOKEN=${setup_token}
APP_DIR=${APP_DIR}
EOF
mkdir -p "$APP_DIR/server/data"
echo "$setup_token" > "$APP_DIR/server/data/setup-token.txt"
ok ".env создан"; }
install_project_deps(){ cd "$APP_DIR"; npm install; ok "npm зависимости установлены"; }
stop_old(){ pm2 delete mtproxy-panel >/dev/null 2>&1 || true; pm2 delete web-panel >/dev/null 2>&1 || true; fuser -k ${PORT}/tcp >/dev/null 2>&1 || true; }
start_project(){ cd "$APP_DIR"; pm2 start server/app.js --name "$APP_NAME" >/dev/null 2>&1; pm2 save >/dev/null 2>&1 || true; ok "Панель запущена"; }
enable_pm2_startup(){ local startup_cmd; startup_cmd="$(pm2 startup systemd -u root --hp /root 2>/dev/null | grep -E '^sudo|^env PATH=')"; if [[ -n "$startup_cmd" ]]; then bash -c "${startup_cmd#sudo }" >/dev/null 2>&1 || true; pm2 save >/dev/null 2>&1 || true; fi; ok "Автозапуск PM2 настроен"; }
open_firewall(){ if command -v ufw >/dev/null 2>&1; then ufw allow "${PORT}/tcp" >/dev/null 2>&1 || true; ok "Порт ${PORT}/tcp добавлен в UFW"; else warn "Открой порт ${PORT} у провайдера, если панель недоступна"; fi; }
print_summary(){ local ip token; ip="$(get_ip)"; token="$(grep '^SETUP_TOKEN=' "$APP_DIR/.env" | cut -d= -f2-)"; log ""; log "========================================="; log "✅ Установка панели завершена"; log ""; log "🌐 Постоянная ссылка входа:"; log "   http://${ip}:${PORT}/login"; log ""; log "🔐 Одноразовая ссылка регистрации:"; log "   http://${ip}:${PORT}/setup/${token}"; log ""; log "========================================="; }
main(){ need_root; install_base_packages; install_nodejs; install_pm2; download_or_update_project; check_project_files; write_env; install_project_deps; stop_old; start_project; enable_pm2_startup; open_firewall; print_summary; }
main "$@"
