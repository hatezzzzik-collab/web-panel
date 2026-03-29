const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const proxyRoutes = require('./routes/proxy.routes');
const logsRoutes = require('./routes/logs.routes');
const authRoutes = require('./routes/auth.routes');
const { attachTerminalWebSocket } = require('./ws/terminal.ws');
const { ensureDataFiles, isAuthenticated, isSetupAllowed, redirectIfAuthenticated } = require('./middleware/auth.middleware');

dotenv.config();
ensureDataFiles();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/proxy', isAuthenticated, proxyRoutes);
app.use('/api/logs', isAuthenticated, logsRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/login', redirectIfAuthenticated, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.get('/setup/:token', isSetupAllowed, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'setup.html'));
});

app.get('/logs.html', isAuthenticated, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'logs.html'));
});

app.get('/terminal.html', isAuthenticated, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'terminal.html'));
});

app.get('/', isAuthenticated, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, '..', 'public')));

attachTerminalWebSocket(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Web panel started on http://0.0.0.0:${PORT}`);
});
