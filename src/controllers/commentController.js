// src/controllers/commentController.js
const pool = require('../db');
const { validationResult } = require('express-validator');

// Add a comment to a post
const addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { body, parent_comment_id } = req.body;
  const { id: post_id } = req.params;
  const author_id = req.user.id;
  try {
    const result = await pool.query(
      `INSERT INTO comments (post_id, author_id, parent_comment_id, body) VALUES ($1, $2, $3, $4) RETURNING *`,
      [post_id, author_id, parent_comment_id || null, body]
    );
    res.status(201).json({ comment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment.' });
  }
};

// List comments for a post (threaded)
const listComments = async (req, res) => {
  const { id: post_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC`,
      [post_id]
    );
    res.json({ comments: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
};

module.exports = { addComment, listComments };
