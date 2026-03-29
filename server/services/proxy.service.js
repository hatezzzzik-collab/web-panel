const net = require('net');
const { execCommand } = require('../utils/exec');
const { parseStatus } = require('../utils/parseStatus');
const PROXY_BIN = process.env.PROXY_BIN || '/usr/local/bin/proxy';

async function getDashboardInfo() {
  const raw = await execCommand(`${PROXY_BIN} status`);
  const status = parseStatus(raw);
  let ping = null;
  try { ping = await tcpPing(status.ip, 443); } catch {}
  const statusText = status.ip ? 'Работает' : 'Не работает';
  return { ...status, statusText, ping };
}
async function setTag(tag) { return await execCommand(`${PROXY_BIN} tag set ${tag}`); }
async function clearTag() { return await execCommand(`${PROXY_BIN} tag clear`); }
async function restartProxy() { return await execCommand(`${PROXY_BIN} restart`); }
function tcpPing(host, port) {
  return new Promise((resolve, reject) => {
    const s = new net.Socket(); const start = Date.now(); let done = false;
    const finish = (fn, val) => { if (done) return; done = true; s.destroy(); fn(val); };
    s.setTimeout(3000);
    s.once('connect', () => finish(resolve, Date.now() - start));
    s.once('error', (e) => finish(reject, e));
    s.once('timeout', () => finish(reject, new Error('timeout')));
    s.connect(port, host);
  });
}
module.exports = { getDashboardInfo, setTag, clearTag, restartProxy };
