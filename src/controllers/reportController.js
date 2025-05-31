// src/controllers/reportController.js
const pool = require('../db');
const { validationResult } = require('express-validator');

// Report a post
const reportPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id: post_id } = req.params;
  const { reason } = req.body;
  const reporter_id = req.user.id;
  try {
    await pool.query(
      `INSERT INTO reports (reporter_id, post_id, reason) VALUES ($1, $2, $3)`,
      [reporter_id, post_id, reason]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to report post.' });
  }
};

// Report a comment
const reportComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id: comment_id } = req.params;
  const { reason } = req.body;
  const reporter_id = req.user.id;
  try {
    await pool.query(
      `INSERT INTO reports (reporter_id, comment_id, reason) VALUES ($1, $2, $3)`,
      [reporter_id, comment_id, reason]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to report comment.' });
  }
};

module.exports = { reportPost, reportComment };
