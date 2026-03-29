# Web Panel v2

Минималистичная чёрно-белая веб-панель для MTProto Proxy.

## Возможности
- одноразовая ссылка первичной регистрации
- постоянная страница входа `/login`
- главная страница с `Статус`, `IP`, `Secret`, `Tag`, `Ping`
- встроенный веб-терминал
- просмотр логов
- управление proxy через команду `proxy`

## Установка
В `install.sh` укажи свой GitHub URL, затем на VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/USERNAME/REPOSITORY/main/install.sh | sudo bash
```
