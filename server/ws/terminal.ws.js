const { WebSocketServer } = require('ws');
const pty = require('node-pty');
const session = require('express-session');

const sessionParser = session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 }
});

function attachTerminalWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    if (request.url !== '/ws/terminal') return;
    sessionParser(request, {}, () => {
      if (!request.session || !request.session.isAuthenticated) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
    });
  });

  wss.on('connection', (ws) => {
    const shell = process.env.SHELL || '/bin/bash';
    const term = pty.spawn(shell, [], { name: 'xterm-color', cols: 120, rows: 30, cwd: '/root', env: process.env });
    term.onData((data) => { if (ws.readyState === ws.OPEN) ws.send(data); });
    ws.on('message', (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === 'resize') return term.resize(parsed.cols || 120, parsed.rows || 30);
        if (parsed.type === 'input') return term.write(parsed.data || '');
      } catch {
        term.write(msg.toString());
      }
    });
    ws.on('close', () => term.kill());
    ws.on('error', () => term.kill());
  });
}

module.exports = { attachTerminalWebSocket };
