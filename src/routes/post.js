// src/routes/post.js
const express = require('express');
const { body, query } = require('express-validator');
const { createPost, discoverPosts, getPost } = require('../controllers/postController');
const { authenticateJWT } = require('../controllers/authController');

const router = express.Router();

// Create post
router.post(
  '/',
  authenticateJWT,
  [
    body('title').isString().isLength({ min: 1, max: 200 }),
    body('body').isString().isLength({ min: 1, max: 2000 }),
    body('location').matches(/^SRID=4326;POINT\((-?\d+\.\d+) (-?\d+\.\d+)\)$/),
    body('reach_radius_m').isInt({ min: 1 })
  ],
  createPost
);

// Discover posts
router.get(
  '/',
  authenticateJWT,
  [
    query('latitude').isFloat(),
    query('longitude').isFloat(),
    query('radius_m').isInt({ min: 1 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  discoverPosts
);

// Get post details
router.get('/:id', authenticateJWT, getPost);

module.exports = router;
