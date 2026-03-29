const terminalElement = document.getElementById('terminal');

const term = new Terminal({
  cursorBlink: true,
  fontSize: 14,
  convertEol: true
});

term.open(terminalElement);
term.write('Подключение к терминалу...\r\n');

const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(`${protocol}://${window.location.host}/ws/terminal`);

ws.onopen = () => {
  term.write('Соединение установлено.\r\n');
};

ws.onmessage = (event) => {
  term.write(event.data);
};

ws.onclose = () => {
  term.write('\r\nСоединение закрыто.\r\n');
};

ws.onerror = () => {
  term.write('\r\nОшибка WebSocket.\r\n');
};

term.onData((data) => {
  ws.send(JSON.stringify({
    type: 'input',
    data
  }));
});

window.addEventListener('resize', () => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'resize',
      cols: term.cols,
      rows: term.rows
    }));
  }
});
