const express = require('express');
const path = require('path');
const ctl = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/', (req,res)=> req.session.user ? res.redirect('/dashboard') : res.redirect('/login'));
router.get('/setup/:token', ctl.openSetupPage);
router.post('/api/setup/:token', ctl.registerFirstAdmin);
router.get('/login', ctl.openLoginPage);
router.post('/api/login', ctl.login);
router.post('/api/logout', ctl.logout);
router.get('/api/me', ctl.me);
router.get('/dashboard', requireAuth, (_req,res)=> res.sendFile(path.join(__dirname,'..','..','public','index.html')));
router.get('/logs', requireAuth, (_req,res)=> res.sendFile(path.join(__dirname,'..','..','public','logs.html')));
router.get('/terminal', requireAuth, (_req,res)=> res.sendFile(path.join(__dirname,'..','..','public','terminal.html')));
router.get('/settings', requireAuth, (_req,res)=> res.sendFile(path.join(__dirname,'..','..','public','settings.html')));
module.exports = router;
