const proxyService = require('../services/proxy.service');

async function getStatus(_req, res) {
  try {
    const data = await proxyService.getStatus();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}

async function getSecret(_req, res) {
  try {
    const secret = await proxyService.getSecret();
    res.json({ ok: true, data: { secret } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}

async function getTag(_req, res) {
  try {
    const tag = await proxyService.getTag();
    res.json({ ok: true, data: { tag } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}

async function setTag(req, res) {
  try {
    const { tag } = req.body;

    if (!tag || !/^[0-9a-fA-F]{32}$/.test(tag)) {
      return res.status(400).json({
        ok: false,
        error: 'Tag должен быть ровно 32 hex-символа'
      });
    }

    const message = await proxyService.setTag(tag);
    res.json({ ok: true, data: { message } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}

async function clearTag(_req, res) {
  try {
    const message = await proxyService.clearTag();
    res.json({ ok: true, data: { message } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}

async function getLink(_req, res) {
  try {
    const link = await proxyService.getLink();
    res.json({ ok: true, data: { link } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}

async function restartProxy(_req, res) {
  try {
    const message = await proxyService.restartProxy();
    res.json({ ok: true, data: { message } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}

async function uninstallProxy(req, res) {
  try {
    const { confirm } = req.body;

    if (confirm !== 'YES') {
      return res.status(400).json({
        ok: false,
        error: 'Для удаления передай confirm=YES'
      });
    }

    const message = await proxyService.uninstallProxy();
    res.json({ ok: true, data: { message } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}

module.exports = {
  getStatus,
  getSecret,
  getTag,
  setTag,
  clearTag,
  getLink,
  restartProxy,
  uninstallProxy
};
