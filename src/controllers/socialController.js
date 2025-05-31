// src/controllers/socialController.js
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Callback handler for social login
const socialCallback = (provider) => (req, res) => {
  // Passport attaches user to req.user after successful auth
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
  // Issue JWT for the user
  const token = jwt.sign({ id: req.user.id, username: req.user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  // Redirect or respond with token
  // For API, respond with token as JSON
  res.json({ token });
};

module.exports = { socialCallback };
