// tests/comment.test.js
const request = require('supertest');
const express = require('express');
const commentRoutes = require('../src/routes/comment');
const postRoutes = require('../src/routes/post');
const authRoutes = require('../src/routes/auth');
const pool = require('../src/db');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

let token, postId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'commentuser@example.com'");
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'commentuser', email: 'commentuser@example.com', password: 'TestPass123!' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'commentuser@example.com', password: 'TestPass123!' });
  token = res.body.token;
  // Create a post
  const postRes = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Comment Test Post',
      body: 'Post for comment tests.',
      location: 'SRID=4326;POINT(74.123456 31.123456)',
      reach_radius_m: 500
    });
  postId = postRes.body.post.id;
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'commentuser@example.com'");
  await pool.end();
});

describe('Comment Endpoints', () => {
  it('should add a comment to a post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'This is a test comment.' });
    expect(res.statusCode).toBe(201);
    expect(res.body.comment).toHaveProperty('id');
  });

  it('should list comments for a post', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.comments)).toBe(true);
  });
});
