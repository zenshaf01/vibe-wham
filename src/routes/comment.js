// src/routes/comment.js
const express = require('express');
const { body } = require('express-validator');
const { addComment, listComments } = require('../controllers/commentController');
const { authenticateJWT } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Add comment to a post
router.post(
  '/',
  authenticateJWT,
  [
    body('body').isString().isLength({ min: 1, max: 1000 }),
    body('parent_comment_id').optional().isUUID()
  ],
  addComment
);

// List comments for a post
router.get('/', authenticateJWT, listComments);

module.exports = router;
