const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth.routes');
const proxyRoutes = require('./routes/proxy.routes');
const logsRoutes = require('./routes/logs.routes');
const settingsRoutes = require('./routes/settings.routes');
const { attachTerminalWebSocket } = require('./ws/terminal.ws');

const app = express();
const server = http.createServer(app);

app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: String(process.env.COOKIE_SECURE || '').toLowerCase() === 'true'
  }
}));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(authRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/settings', settingsRoutes);
app.get('/health', (_req, res) => res.json({ ok: true }));
attachTerminalWebSocket(server);

const port = Number(process.env.PORT || 3000);
server.listen(port, '0.0.0.0', () => {
  console.log(`Web panel started on http://0.0.0.0:${port}`);
});
