// src/routes/vote.js
const express = require('express');
const { body } = require('express-validator');
const { votePost, voteComment } = require('../controllers/voteController');
const { authenticateJWT } = require('../controllers/authController');

const router = express.Router();

// Upvote/downvote post
router.post('/posts/:id/vote', authenticateJWT, [body('vote_type').isIn([1, -1])], votePost);
// Upvote/downvote comment
router.post('/comments/:id/vote', authenticateJWT, [body('vote_type').isIn([1, -1])], voteComment);

module.exports = router;
