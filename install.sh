#!/bin/bash
# ============================================
# MTProxy Panel — автоустановка с GitHub
# ============================================

set -euo pipefail

APP_NAME="mtproxy-panel"
APP_DIR="/opt/mtproxy-panel"
REPO_URL="https://github.com/hatezzzzik-collab/web-panel.git"
BRANCH="main"
PORT="3000"
PROXY_BIN="/usr/local/bin/proxy"
CONTAINER_NAME="mtproxy"

log()  { echo -e "$*"; }
ok()   { echo -e "   ✅ $*"; }
warn() { echo -e "   ⚠️  $*"; }
err()  { echo -e "   ❌ $*"; }
die()  { err "$*"; exit 1; }

need_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    die "Запусти установку от root: sudo bash install.sh"
  fi
}

cmd_exists() {
  command -v "$1" >/dev/null 2>&1
}

get_ip() {
  curl -4 -fsS ifconfig.me 2>/dev/null \
    || curl -4 -fsS icanhazip.com 2>/dev/null \
    || hostname -I | awk '{print $1}'
}

install_base_packages() {
  log "📦 Устанавливаю базовые зависимости..."
  apt-get update -qq
  apt-get install -y -qq \
    curl \
    ca-certificates \
    gnupg \
    git \
    unzip \
    build-essential \
    python3 \
    pkg-config >/dev/null 2>&1

  ok "Базовые зависимости установлены"
}

install_nodejs() {
  if cmd_exists node && cmd_exists npm; then
    ok "Node.js уже установлен: $(node -v), npm: $(npm -v)"
    return
  fi

  log "📦 Устанавливаю Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs >/dev/null 2>&1

  cmd_exists node || die "Node.js не установился"
  cmd_exists npm || die "npm не установился"

  ok "Node.js установлен: $(node -v)"
  ok "npm установлен: $(npm -v)"
}

install_pm2() {
  if cmd_exists pm2; then
    ok "PM2 уже установлен"
    return
  fi

  log "📦 Устанавливаю PM2..."
  npm install -g pm2 >/dev/null 2>&1
  cmd_exists pm2 || die "PM2 не установился"
  ok "PM2 установлен"
}

check_proxy() {
  if [[ ! -x "$PROXY_BIN" ]]; then
    warn "Команда $PROXY_BIN не найдена"
    warn "Панель установится, но управление proxy не будет работать, пока не установишь proxy"
  else
    ok "Найдена команда proxy: $PROXY_BIN"
  fi
}

download_or_update_project() {
  if [[ -d "$APP_DIR/.git" ]]; then
    log "🔄 Обновляю проект..."
    git -C "$APP_DIR" fetch origin "$BRANCH" >/dev/null 2>&1
    git -C "$APP_DIR" checkout "$BRANCH" >/dev/null 2>&1
    git -C "$APP_DIR" reset --hard "origin/$BRANCH" >/dev/null 2>&1
    ok "Проект обновлён"
  else
    log "📥 Скачиваю проект из GitHub..."
    rm -rf "$APP_DIR"
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR" >/dev/null 2>&1 || die "Не удалось скачать проект из GitHub. Проверь, что репозиторий public и REPO_URL указан верно."
    ok "Проект скачан"
  fi
}

check_project_files() {
  [[ -f "$APP_DIR/package.json" ]] || die "Не найден $APP_DIR/package.json"
  [[ -f "$APP_DIR/server/app.js" ]] || die "Не найден $APP_DIR/server/app.js"
  [[ -d "$APP_DIR/public" ]] || die "Не найдена папка $APP_DIR/public"
  ok "Структура проекта корректна"
}

write_env() {
  log "⚙️  Создаю .env..."
  cat > "$APP_DIR/.env" <<EOF2
PORT=${PORT}
PROXY_BIN=${PROXY_BIN}
CONTAINER_NAME=${CONTAINER_NAME}
EOF2
  ok ".env создан"
}

install_project_deps() {
  log "📦 Устанавливаю npm зависимости..."
  cd "$APP_DIR"
  npm install
  ok "npm зависимости установлены"
}

start_project() {
  log "🚀 Запускаю панель через PM2..."
  cd "$APP_DIR"

  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  pm2 start server/app.js --name "$APP_NAME" >/dev/null 2>&1
  pm2 save >/dev/null 2>&1 || true

  if ! pm2 status | grep -q "$APP_NAME"; then
    die "Не удалось запустить панель через PM2"
  fi

  ok "Панель запущена"
}

enable_pm2_startup() {
  log "⚙️  Настраиваю автозапуск PM2..."
  local startup_cmd
  startup_cmd="$(pm2 startup systemd -u root --hp /root 2>/dev/null | grep -E '^sudo|^env PATH=')"

  if [[ -n "$startup_cmd" ]]; then
    bash -c "${startup_cmd#sudo }" >/dev/null 2>&1 || true
    pm2 save >/dev/null 2>&1 || true
  fi

  ok "Автозапуск PM2 настроен"
}

open_firewall() {
  if cmd_exists ufw; then
    ufw allow "${PORT}/tcp" >/dev/null 2>&1 || true
    ufw allow 443/tcp >/dev/null 2>&1 || true
    ok "Порт ${PORT}/tcp добавлен в UFW"
  else
    warn "UFW не найден, если панель не открывается — открой порт ${PORT} у провайдера/VPS firewall"
  fi
}

print_summary() {
  local ip
  ip="$(get_ip)"

  log ""
  log "========================================="
  log "✅ Установка панели завершена"
  log ""
  log "📁 Папка проекта:"
  log "   ${APP_DIR}"
  log ""
  log "🌐 Панель доступна по адресу:"
  log "   http://${ip}:${PORT}"
  log ""
  log "🛠  Полезные команды:"
  log "   pm2 status"
  log "   pm2 logs ${APP_NAME}"
  log "   pm2 restart ${APP_NAME}"
  log "   pm2 stop ${APP_NAME}"
  log ""
  log "📌 Proxy команды:"
  log "   proxy status"
  log "   proxy link"
  log "   proxy tag show"
  log "========================================="
}

main() {
  need_root

  log ""
  log "🖥  Установка MTProxy Panel"
  log "========================================="

  install_base_packages
  install_nodejs
  install_pm2
  check_proxy
  download_or_update_project
  check_project_files
  write_env
  install_project_deps
  start_project
  enable_pm2_startup
  open_firewall
  print_summary
}

main "$@"
