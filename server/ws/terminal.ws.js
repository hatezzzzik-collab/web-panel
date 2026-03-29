const { WebSocketServer } = require('ws');
let pty = null;
try {
  pty = require('node-pty');
} catch {
  pty = null;
}

function parseCookie(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function attachTerminalWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws/terminal' });

  wss.on('connection', (ws, req) => {
    const cookies = parseCookie(req.headers.cookie || '');
    if (!cookies['connect.sid']) {
      ws.close(1008, 'auth required');
      return;
    }

    if (!pty) {
      ws.send('Модуль node-pty недоступен на сервере. Терминал временно отключён.\r\n');
      ws.close(1011, 'node-pty unavailable');
      return;
    }

    const cwd = process.env.TERMINAL_CWD || process.env.HOME || '/';
    const shell = process.env.SHELL || '/bin/bash';
    const term = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 120,
      rows: 30,
      cwd,
      env: process.env
    });

    term.onData((data) => {
      if (ws.readyState === ws.OPEN) ws.send(data);
    });

    ws.on('message', (msg) => {
      try {
        const p = JSON.parse(msg.toString());
        if (p.type === 'resize') {
          term.resize(Math.max(20, Number(p.cols) || 120), Math.max(10, Number(p.rows) || 30));
          return;
        }
        if (p.type === 'input') {
          term.write(String(p.data || ''));
          return;
        }
      } catch {}
      term.write(msg.toString());
    });

    const cleanup = () => {
      try { term.kill(); } catch {}
    };

    ws.on('close', cleanup);
    ws.on('error', cleanup);
  });
}

module.exports = { attachTerminalWebSocket };
