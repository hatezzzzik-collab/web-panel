const { WebSocketServer } = require('ws');
const pty = require('node-pty');
function parseCookie(header){ const out={}; if(!header) return out; for(const part of header.split(';')){ const i=part.indexOf('='); if(i===-1) continue; out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim()); } return out; }
function attachTerminalWebSocket(server){
  const wss = new WebSocketServer({ server, path:'/ws/terminal' });
  wss.on('connection', (ws, req) => {
    const cookies = parseCookie(req.headers.cookie || '');
    if (!cookies['connect.sid']) return ws.close();
    const term = pty.spawn(process.env.SHELL || '/bin/bash', [], { name:'xterm-256color', cols:120, rows:30, cwd:'/root', env:process.env });
    term.onData(data => { if (ws.readyState === ws.OPEN) ws.send(data); });
    ws.on('message', msg => { try { const p = JSON.parse(msg.toString()); if (p.type==='resize') return term.resize(p.cols||120, p.rows||30); if (p.type==='input') return term.write(p.data||''); } catch {} term.write(msg.toString()); });
    ws.on('close', ()=>term.kill());
    ws.on('error', ()=>term.kill());
  });
}
module.exports = { attachTerminalWebSocket };
