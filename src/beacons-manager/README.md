# Beacons Manager

A Next.js application for managing beacons and their locations with SQLite database.

## Features

- User authentication (register/login)
- Beacon management (CRUD operations)
- Location management linked to beacons
- SQLite database for data persistence
- Responsive UI with Tailwind CSS
- TypeScript support
- API routes for backend functionality

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Node.js
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT tokens with bcryptjs
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env.local
   ```

4. Initialize the database:
   ```bash
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Beacons
- `GET /api/beacons` - Get user's beacons
- `POST /api/beacons` - Create new beacon
- `GET /api/beacons/[id]` - Get specific beacon
- `PUT /api/beacons/[id]` - Update beacon
- `DELETE /api/beacons/[id]` - Delete beacon

### Locations
- `GET /api/locations` - Get user's locations
- `POST /api/locations` - Create new location
- `GET /api/locations/[id]` - Get specific location
- `PUT /api/locations/[id]` - Update location
- `DELETE /api/locations/[id]` - Delete location

## Database Schema

### Users
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- name (TEXT)
- password_hash (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

### Beacons
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- uuid (TEXT)
- major (INTEGER)
- minor (INTEGER)
- description (TEXT)
- user_id (INTEGER FOREIGN KEY)
- created_at (DATETIME)
- updated_at (DATETIME)

### Locations
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- latitude (REAL)
- longitude (REAL)
- description (TEXT)
- beacon_id (INTEGER FOREIGN KEY)
- created_at (DATETIME)
- updated_at (DATETIME)

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

The project includes `vercel.json` configuration for optimal deployment.

## Environment Variables

- `DATABASE_URL` - Path to SQLite database file
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Initialize database