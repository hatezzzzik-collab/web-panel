const { WebSocketServer } = require('ws');
const pty = require('node-pty');

function attachTerminalWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws/terminal' });

  wss.on('connection', (ws) => {
    const shell = process.env.SHELL || '/bin/bash';

    const term = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 120,
      rows: 30,
      cwd: '/root',
      env: process.env
    });

    term.onData((data) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    });

    ws.on('message', (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());

        if (parsed.type === 'resize') {
          term.resize(parsed.cols || 120, parsed.rows || 30);
          return;
        }

        if (parsed.type === 'input') {
          term.write(parsed.data || '');
        }
      } catch {
        term.write(msg.toString());
      }
    });

    ws.on('close', () => {
      term.kill();
    });

    ws.on('error', () => {
      term.kill();
    });
  });
}

module.exports = { attachTerminalWebSocket };
