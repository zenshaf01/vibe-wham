// tests/report.test.js
const request = require('supertest');
const express = require('express');
const reportRoutes = require('../src/routes/report');
const postRoutes = require('../src/routes/post');
const authRoutes = require('../src/routes/auth');
const pool = require('../src/db');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', reportRoutes);

let token, postId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'reportuser@example.com'");
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'reportuser', email: 'reportuser@example.com', password: 'TestPass123!' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'reportuser@example.com', password: 'TestPass123!' });
  token = res.body.token;
  // Create a post
  const postRes = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Report Test Post',
      body: 'Post for report tests.',
      location: 'SRID=4326;POINT(74.123456 31.123456)',
      reach_radius_m: 500
    });
  postId = postRes.body.post.id;
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'reportuser@example.com'");
  await pool.end();
});

describe('Report Endpoints', () => {
  it('should report a post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/report`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Inappropriate content' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
