const express = require('express');
const ctl = require('../controllers/logs.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const router = express.Router();
router.use(requireAuth);
router.get('/', ctl.getLogs);
module.exports = router;
