// src/routes/report.js
const express = require('express');
const { body } = require('express-validator');
const { reportPost, reportComment } = require('../controllers/reportController');
const { authenticateJWT } = require('../controllers/authController');

const router = express.Router();

// Report post
router.post('/posts/:id/report', authenticateJWT, [body('reason').isString().isLength({ min: 1, max: 500 })], reportPost);
// Report comment
router.post('/comments/:id/report', authenticateJWT, [body('reason').isString().isLength({ min: 1, max: 500 })], reportComment);

module.exports = router;
