const express = require('express');
const controller = require('../controllers/logs.controller');
const router = express.Router();
router.get('/', controller.getLogs);
module.exports = router;
