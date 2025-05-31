// src/controllers/postController.js
const pool = require('../db');
const { validationResult } = require('express-validator');

// Create a new post
const createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, body, location, reach_radius_m } = req.body;
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `INSERT INTO posts (author_id, title, body, location, reach_radius_m) 
       VALUES ($1, $2, $3, ST_GeogFromText($4), $5) RETURNING *`,
      [userId, title, body, location, reach_radius_m]
    );
    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post.' });
  }
};

// Discover posts within user's location and radius
const discoverPosts = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { latitude, longitude, radius_m, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const result = await pool.query(
      `SELECT *, ST_Distance(location, ST_MakePoint($1, $2)::geography) AS distance
       FROM posts
       WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, reach_radius_m)
         AND ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3)
       ORDER BY distance ASC, created_at DESC
       LIMIT $4 OFFSET $5`,
      [longitude, latitude, radius_m, limit, offset]
    );
    res.json({ posts: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to discover posts.' });
  }
};

// Get post details
const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Post not found.' });
    res.json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get post.' });
  }
};

module.exports = { createPost, discoverPosts, getPost };
