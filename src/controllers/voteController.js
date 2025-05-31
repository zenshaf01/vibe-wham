// src/controllers/voteController.js
const pool = require('../db');
const { validationResult } = require('express-validator');

// Upvote/downvote a post
const votePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id: post_id } = req.params;
  const { vote_type } = req.body; // 1 or -1
  const user_id = req.user.id;
  try {
    // Upsert vote
    await pool.query(
      `INSERT INTO votes (user_id, post_id, vote_type) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, post_id) DO UPDATE SET vote_type = $3, created_at = CURRENT_TIMESTAMP`,
      [user_id, post_id, vote_type]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote on post.' });
  }
};

// Upvote/downvote a comment
const voteComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id: comment_id } = req.params;
  const { vote_type } = req.body; // 1 or -1
  const user_id = req.user.id;
  try {
    await pool.query(
      `INSERT INTO votes (user_id, comment_id, vote_type) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, comment_id) DO UPDATE SET vote_type = $3, created_at = CURRENT_TIMESTAMP`,
      [user_id, comment_id, vote_type]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote on comment.' });
  }
};

module.exports = { votePost, voteComment };
