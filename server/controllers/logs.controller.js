const svc = require('../services/logs.service');
async function getLogs(req, res) { try { res.json({ ok: true, data: { logs: await svc.getLogs(Number(req.query.tail || 150)) } }); } catch (error) { res.status(500).json({ ok: false, error: String(error) }); } }
module.exports = { getLogs };
