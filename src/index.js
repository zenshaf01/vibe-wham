// src/index.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('./passport');
const session = require('express-session');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const socialRoutes = require('./routes/social');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
const voteRoutes = require('./routes/vote');
const reportRoutes = require('./routes/report');

const app = express();
app.use(express.json());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Session for social login
app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Placeholder for routes
app.get('/', (req, res) => {
  res.send('Vibe-Wham API');
});

app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts/:id/comments', commentRoutes);
app.use('/api', voteRoutes);
app.use('/api', reportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
