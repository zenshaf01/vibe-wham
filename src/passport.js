// src/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const pool = require('./db');

// Serialize/deserialize user for session (not used for JWT, but required by passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/social/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const providerId = profile.id;
    // Upsert user
    let result = await pool.query('SELECT * FROM users WHERE oauth_provider = $1 AND oauth_provider_id = $2', ['google', providerId]);
    let user = result.rows[0];
    if (!user) {
      // If not found, create new user
      result = await pool.query(
        'INSERT INTO users (username, email, oauth_provider, oauth_provider_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [profile.displayName, email, 'google', providerId]
      );
      user = result.rows[0];
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/api/social/facebook/callback',
  profileFields: ['id', 'displayName', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const providerId = profile.id;
    let result = await pool.query('SELECT * FROM users WHERE oauth_provider = $1 AND oauth_provider_id = $2', ['facebook', providerId]);
    let user = result.rows[0];
    if (!user) {
      result = await pool.query(
        'INSERT INTO users (username, email, oauth_provider, oauth_provider_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [profile.displayName, email, 'facebook', providerId]
      );
      user = result.rows[0];
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;
