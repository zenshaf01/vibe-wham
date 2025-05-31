// tests/post.test.js
const request = require('supertest');
const express = require('express');
const postRoutes = require('../src/routes/post');
const authRoutes = require('../src/routes/auth');
const pool = require('../src/db');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

let token;

beforeAll(async () => {
  // Register and login a test user
  await pool.query("DELETE FROM users WHERE email = 'postuser@example.com'");
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'postuser', email: 'postuser@example.com', password: 'TestPass123!' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'postuser@example.com', password: 'TestPass123!' });
  token = res.body.token;
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'postuser@example.com'");
  await pool.end();
});

describe('Post Endpoints', () => {
  let postId;
  it('should create a new post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Post',
        body: 'This is a test post.',
        location: 'SRID=4326;POINT(74.123456 31.123456)',
        reach_radius_m: 500
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.post).toHaveProperty('id');
    postId = res.body.post.id;
  });

  it('should get post details', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.post).toHaveProperty('id', postId);
  });

  it('should discover posts by location', async () => {
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .query({
        latitude: 31.123456,
        longitude: 74.123456,
        radius_m: 1000
      });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.posts)).toBe(true);
  });
});
