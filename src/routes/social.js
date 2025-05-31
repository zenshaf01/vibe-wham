// src/routes/social.js
const express = require('express');
const passport = require('passport');
const { socialCallback } = require('../controllers/socialController');
const router = express.Router();

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), socialCallback('google'));

// Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), socialCallback('facebook'));

module.exports = router;
