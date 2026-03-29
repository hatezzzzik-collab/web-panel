const path = require('path');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const proxyRoutes = require('./routes/proxy.routes');
const logsRoutes = require('./routes/logs.routes');
const { attachTerminalWebSocket } = require('./ws/terminal.ws');

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/proxy', proxyRoutes);
app.use('/api/logs', logsRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

attachTerminalWebSocket(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`MTProxy panel started on http://0.0.0.0:${PORT}`);
});
