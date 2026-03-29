const path = require('path');
const svc = require('../services/settings.service');

function page(_req, res) {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'settings.html'));
}

function listUploads(_req, res) {
  res.json({ ok: true, data: { files: svc.listUploads() } });
}

function clearUploads(_req, res) {
  svc.clearUploads();
  res.json({ ok: true });
}

function uploadZip(req, res) {
  if (!req.file) return res.status(400).json({ ok: false, error: 'ZIP не загружен' });
  res.json({ ok: true, data: { filename: req.file.filename } });
}

async function applyUpdate(req, res) {
  try {
    if (!req.body.filename) return res.status(400).json({ ok: false, error: 'Не указан filename' });
    const result = svc.applyZipUpdate(path.join(svc.uploadsDir, req.body.filename));
    res.json({ ok: true, data: { message: result.message } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
}

async function restartPanel(_req, res) {
  try {
    res.json({ ok: true, data: { message: await svc.restartPanel() } });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
}

module.exports = { page, listUploads, clearUploads, uploadZip, applyUpdate, restartPanel };
