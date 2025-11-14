# CodeWave Project Setup Guide

This guide will help you set up and run the CodeWave project (TripWave application) with both frontend and backend.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Project Structure

```
CodeWave/
├── backend/          # Express.js API server
├── frontend/         # Nuxt 3 + Vuetify 3 frontend
└── README.md
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```bash
createdb your_database_name
```

2. Run the schema SQL file to create all tables:
```bash
psql -U your_username -d your_database_name -f database/schema.sql
```

Or using connection string:
```bash
psql postgresql://username:password@host:port/database -f database/schema.sql
```

The schema includes:
- GTFS tables (agency, stops, routes, trips, stop_times, calendar, calendar_dates, shapes, feed_info)
- Users table for authentication

### 3. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# JWT Secret Key (use a strong random string in production)
APP_SECRET=your_jwt_secret_key_here_change_in_production

# Server Port
PORT=8000

# LM Studio Configuration (for AI recommendations)
LM_STUDIO_URL=http://localhost:1234/v1/chat/completions
```

**Important**: Generate a strong random string for `APP_SECRET`. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:8000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

The frontend uses Nuxt's runtime config. The API base URL is configured in `nuxt.config.ts` and defaults to `http://localhost:8000/api/v1`.

To change it, you can:
- Set `API_BASE_URL` environment variable
- Or modify `nuxt.config.ts` directly

### 3. Run the Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Running Both Servers

### Option 1: Separate Terminals

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Option 2: Using a Process Manager

You can use `concurrently` or `npm-run-all` to run both:

```bash
# Install globally
npm install -g concurrently

# From project root
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

## API Endpoints

### Authentication
- `POST /api/v1/signup` - Create a new user account
- `POST /api/v1/signin` - Sign in with email and password
- `POST /api/v1/signout` - Sign out
- `POST /api/v1/check-email` - Check if email exists

### Users (Protected - requires authentication token)
- `GET /api/v1/users` - Get all users (requires auth)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (admin only)

### Authentication Headers

For protected routes, include the JWT token in the request header:
```
x-access-token: <your_jwt_token>
```

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:
```bash
pg_isready
```

2. Check your `.env` file has correct database credentials

3. Verify the database exists:
```bash
psql -U your_username -l
```

### "relation gtfs.users does not exist" Error

This means the users table hasn't been created. Run:
```bash
psql -U your_username -d your_database_name -f backend/database/schema.sql
```

### Port Already in Use

If port 8000 (backend) or 3000 (frontend) is already in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Nuxt will automatically use the next available port

### CORS Issues

CORS is enabled in the backend. If you encounter CORS errors:
- Verify the frontend URL is allowed in `backend/server.js`
- Check that the API base URL in frontend matches the backend port

### Image Not Loading

The landing page background image should be at `frontend/assets/landing-bg.jpeg`. If it's missing, add it or update the image path in the signin/signup pages.

## Development Notes

- Backend uses ES modules (`type: "module"` in package.json)
- Frontend uses Nuxt 3 with Vuetify 3
- Authentication uses JWT tokens stored in localStorage
- Database uses PostgreSQL with GTFS schema

## Next Steps

1. Import GTFS data using `backend/database/importData.js`:
```bash
cd backend
npm run import-gtfs
```

2. Test the authentication flow:
   - Sign up a new user
   - Sign in with credentials
   - Access protected routes

3. Explore the application:
   - Dashboard: `/dashboard`
   - Plan Trip: `/plan`
   - Recommendations: `/recommend`

