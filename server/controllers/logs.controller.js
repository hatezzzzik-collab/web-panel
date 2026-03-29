const logsService = require('../services/logs.service');

async function getLogs(req, res) {
  try {
    const tail = Number(req.query.tail || 100);
    const logs = await logsService.getLogs(tail);
    res.json({ ok: true, data: { logs } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}

module.exports = {
  getLogs
};
