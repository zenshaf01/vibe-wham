# Design Document: Location-Based Social Platform (Vibe-Wham)

## Overview
This document outlines the architecture, database schema, API specifications, and step-by-step implementation plan for a location-based social platform using Node.js, Express.js, PostgreSQL (with PostGIS), and JWT authentication. The platform enables users to create, discover, and interact with posts based on geographic proximity.

---

## 1. System Architecture

- **Backend:** Node.js with Express.js
- **Database:** PostgreSQL with PostGIS extension
- **Authentication:** JWT (JSON Web Tokens)
- **API:** RESTful endpoints
- **Security:** Input validation, rate limiting, abuse prevention, GDPR compliance
- **Performance:** Caching, optimized geospatial queries, database indexing

---

## 2. Database Schema

### Users
- `id` (UUID, PK)
- `username` (varchar, unique, required)
- `email` (varchar, unique, required)
- `password_hash` (varchar, required)
- `created_at` (timestamp)
- `last_location` (geography(Point, 4326), nullable, encrypted)
- `location_updated_at` (timestamp, nullable)

### Posts
- `id` (UUID, PK)
- `author_id` (UUID, FK -> users.id)
- `title` (varchar(200), required)
- `body` (varchar(2000), required)
- `location` (geography(Point, 4326), required, encrypted)
- `reach_radius_m` (integer, required)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Comments
- `id` (UUID, PK)
- `post_id` (UUID, FK -> posts.id)
- `author_id` (UUID, FK -> users.id)
- `parent_comment_id` (UUID, FK -> comments.id, nullable)
- `body` (varchar(1000), required)
- `created_at` (timestamp)

### Votes
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id)
- `post_id` (UUID, FK -> posts.id, nullable)
- `comment_id` (UUID, FK -> comments.id, nullable)
- `vote_type` (smallint, 1=upvote, -1=downvote)
- `created_at` (timestamp)

### Reports
- `id` (UUID, PK)
- `reporter_id` (UUID, FK -> users.id)
- `post_id` (UUID, FK -> posts.id, nullable)
- `comment_id` (UUID, FK -> comments.id, nullable)
- `reason` (varchar(500))
- `created_at` (timestamp)

#### Indexes
- GIST index on `posts.location`
- Index on `posts.created_at`
- Index on `comments.post_id`
- Index on `votes.post_id`, `votes.comment_id`

---

## 3. API Endpoint Specifications

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT

### Posts
- `POST /api/posts` — Create post (requires JWT, location, radius)
- `GET /api/posts` — Discover posts (requires JWT, user location, supports pagination, sorted by distance & recency)
- `GET /api/posts/:id` — Get post details
- `POST /api/posts/:id/vote` — Upvote/downvote post
- `POST /api/posts/:id/report` — Report post

### Comments
- `POST /api/posts/:id/comments` — Add comment
- `GET /api/posts/:id/comments` — List comments (threaded)
- `POST /api/comments/:id/vote` — Upvote/downvote comment
- `POST /api/comments/:id/report` — Report comment

### User
- `GET /api/user/me` — Get current user profile
- `POST /api/user/location` — Update user location (with verification)

---

## 4. Implementation Steps & How They Will Be Performed

### 1. Project Setup
- Initialize Node.js project with Express.js ✅ (done)
- Set up PostgreSQL with PostGIS (PostgreSQL installed, PostGIS will be enabled during migration) ✅
- Configure environment variables (DB, JWT secret, etc.) ✅
- Install dependencies: express, pg, postgis, jsonwebtoken, bcrypt, express-rate-limit, joi (validation), helmet, etc. ✅ (done)

### 2. Database Design & Migration
- Write SQL migration scripts for schema
- Enable PostGIS extension
- Add GIST index for geospatial queries
- Use encryption for sensitive location columns (e.g., pgcrypto)

### 3. Authentication & User Management
- Implement registration & login endpoints
- Hash passwords with bcrypt
- Issue JWTs on login
- Middleware for JWT validation
- Integrate social login (OAuth 2.0) for Google and Facebook:
  - Use Passport.js with Google and Facebook strategies
  - On successful OAuth login, create or update user record
  - Issue JWT for authenticated sessions
  - Store OAuth provider and provider user ID in users table

### 4. Post Creation & Discovery
- Endpoint for creating posts (validate input, capture location, store with precision)
- Endpoint for discovering posts:
  - Accepts user location, radius, pagination
  - Uses PostGIS `ST_DWithin` for proximity
  - Sorts by distance (ST_Distance) and recency
  - Returns posts within reach radius
- Real-time updates: (future step, e.g., with websockets)

### 5. Engagement Features
- Comment endpoints (threaded, parent_comment_id)
- Upvote/downvote endpoints (posts & comments)
- Report endpoints (posts & comments)
- Rate limiting on engagement endpoints

### 6. Security & Abuse Prevention
- Input validation/sanitization (Joi)
- Rate limiting (express-rate-limit)
- Abuse detection (e.g., repeated reports, voting patterns)
- Encrypt location data (use pgcrypto or application-level encryption)
- GDPR compliance: allow users to delete data, anonymize location

### 7. Performance & Scalability
- Optimize queries (indexes, query plans)
- Caching (e.g., Redis for hot queries)
- Load testing (simulate 10,000+ users)
- Ensure <500ms response for location queries

### 8. Testing & Documentation
- Write unit/integration tests (Jest, Supertest)
- API documentation (OpenAPI/Swagger)
- Deployment scripts (Docker, CI/CD)

---

## 5. Notes
- Geolocation precision: store coordinates to 6 decimal places
- Post reach: calculate using PostGIS, ensure accuracy within 50 meters
- Pagination: use cursor-based for scalability
- Real-time: consider WebSocket for live updates (future enhancement)

---

## 6. References
- [PostGIS Documentation](https://postgis.net/docs/)
- [GDPR Guidelines](https://gdpr.eu/location-data-gdpr/)
- [Express.js](https://expressjs.com/)
- [JWT](https://jwt.io/)

---

*Prepared for implementation of Vibe-Wham: Location-Based Social Platform*
