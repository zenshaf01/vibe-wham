// tests/vote.test.js
const request = require('supertest');
const express = require('express');
const voteRoutes = require('../src/routes/vote');
const postRoutes = require('../src/routes/post');
const authRoutes = require('../src/routes/auth');
const pool = require('../src/db');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', voteRoutes);

let token, postId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'voteuser@example.com'");
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'voteuser', email: 'voteuser@example.com', password: 'TestPass123!' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'voteuser@example.com', password: 'TestPass123!' });
  token = res.body.token;
  // Create a post
  const postRes = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Vote Test Post',
      body: 'Post for vote tests.',
      location: 'SRID=4326;POINT(74.123456 31.123456)',
      reach_radius_m: 500
    });
  postId = postRes.body.post.id;
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'voteuser@example.com'");
  await pool.end();
});

describe('Vote Endpoints', () => {
  it('should upvote a post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ vote_type: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should downvote a post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ vote_type: -1 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
