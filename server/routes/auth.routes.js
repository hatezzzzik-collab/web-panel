const express = require('express');
const controller = require('../controllers/auth.controller');

const router = express.Router();
router.get('/me', controller.me);
router.get('/setup-status', controller.setupStatus);
router.post('/setup', controller.setup);
router.post('/login', controller.login);
router.post('/logout', controller.logout);

module.exports = router;
