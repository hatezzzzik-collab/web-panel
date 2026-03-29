const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth.middleware');
const ctl = require('../controllers/settings.controller');
const svc = require('../services/settings.service');
svc.ensureUploads();
const storage = multer.diskStorage({
  destination: (_req,_file,cb)=>cb(null, svc.uploadsDir),
  filename: (_req,file,cb)=>cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`)
});
const upload = multer({ storage });
const router = express.Router();
router.use(requireAuth);
router.get('/page', ctl.page);
router.get('/uploads', ctl.listUploads);
router.delete('/uploads', ctl.clearUploads);
router.post('/upload', upload.single('zip'), ctl.uploadZip);
router.post('/apply', ctl.applyUpdate);
router.post('/restart', ctl.restartPanel);
module.exports = router;
