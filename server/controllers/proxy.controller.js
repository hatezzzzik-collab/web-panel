const proxyService = require('../services/proxy.service');

async function getStatus(_req, res) {
  try {
    const [data, ping] = await Promise.all([
      proxyService.getStatus().catch(() => ({ status: '🔴 (не работает)', ip: '', secret: '', tag: '', link: '' })),
      proxyService.getPing().catch(() => '—')
    ]);
    res.json({ ok: true, data: { ...data, ping } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}
async function getSecret(_req, res) { try { res.json({ ok: true, data: { secret: await proxyService.getSecret() } }); } catch (e) { res.status(500).json({ ok: false, error: String(e) }); } }
async function getTag(_req, res) { try { res.json({ ok: true, data: { tag: await proxyService.getTag() } }); } catch (e) { res.status(500).json({ ok: false, error: String(e) }); } }
async function setTag(req, res) {
  try {
    const { tag } = req.body;
    if (!tag || !/^[0-9a-fA-F]{32}$/.test(tag)) return res.status(400).json({ ok: false, error: 'Tag должен быть ровно 32 hex-символа' });
    res.json({ ok: true, data: { message: await proxyService.setTag(tag) } });
  } catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
}
async function clearTag(_req, res) { try { res.json({ ok: true, data: { message: await proxyService.clearTag() } }); } catch (e) { res.status(500).json({ ok: false, error: String(e) }); } }
async function getLink(_req, res) { try { res.json({ ok: true, data: { link: await proxyService.getLink() } }); } catch (e) { res.status(500).json({ ok: false, error: String(e) }); } }
async function restartProxy(_req, res) { try { res.json({ ok: true, data: { message: await proxyService.restartProxy() } }); } catch (e) { res.status(500).json({ ok: false, error: String(e) }); } }
async function uninstallProxy(req, res) {
  try {
    if (req.body.confirm !== 'YES') return res.status(400).json({ ok: false, error: 'Для удаления передай confirm=YES' });
    res.json({ ok: true, data: { message: await proxyService.uninstallProxy() } });
  } catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
}
module.exports = { getStatus, getSecret, getTag, setTag, clearTag, getLink, restartProxy, uninstallProxy };
