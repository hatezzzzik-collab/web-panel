const svc = require('../services/proxy.service');
async function dashboard(_req, res) { try { res.json({ ok: true, data: await svc.getDashboardInfo() }); } catch (error) { res.status(500).json({ ok: false, error: String(error) }); } }
async function setTag(req, res) { try { const tag = req.body.tag; if (!tag || !/^[0-9a-fA-F]{32}$/.test(tag)) return res.status(400).json({ ok: false, error: 'Tag должен быть 32 hex' }); res.json({ ok: true, data: { message: await svc.setTag(tag) } }); } catch (error) { res.status(500).json({ ok: false, error: String(error) }); } }
async function clearTag(_req, res) { try { res.json({ ok: true, data: { message: await svc.clearTag() } }); } catch (error) { res.status(500).json({ ok: false, error: String(error) }); } }
async function restartProxy(_req, res) { try { res.json({ ok: true, data: { message: await svc.restartProxy() } }); } catch (error) { res.status(500).json({ ok: false, error: String(error) }); } }
module.exports = { dashboard, setTag, clearTag, restartProxy };
