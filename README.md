# MTProxy Panel

Веб-панель для управления MTProto Proxy.

## Возможности

- статус proxy
- secret для @MTProxybot
- tag show / set / clear
- ссылка Telegram
- restart proxy
- docker logs
- веб-терминал в браузере

## Установка

Измени `REPO_URL` в `install.sh`, затем на VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/USERNAME/REPOSITORY/main/install.sh | sudo bash
```

## Требования

- Ubuntu 20.04 / 22.04 / 24.04
- установленный `/usr/local/bin/proxy`
- Docker
