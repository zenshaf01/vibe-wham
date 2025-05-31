// tests/auth.test.js
const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');
const pool = require('../src/db');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Clean up test users after tests
afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email LIKE 'testuser%@example.com'");
  await pool.end();
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser1', email: 'testuser1@example.com', password: 'TestPass123!' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('email', 'testuser1@example.com');
  });

  it('should not register with duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser2', email: 'testuser2@example.com', password: 'TestPass123!' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser2', email: 'testuser2@example.com', password: 'TestPass123!' });
    expect(res.statusCode).toBe(409);
  });

  it('should login with correct credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser3', email: 'testuser3@example.com', password: 'TestPass123!' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser3@example.com', password: 'TestPass123!' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser4', email: 'testuser4@example.com', password: 'TestPass123!' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser4@example.com', password: 'WrongPass!' });
    expect(res.statusCode).toBe(401);
  });
});
