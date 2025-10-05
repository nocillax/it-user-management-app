# IT User Management Backend

Express.js backend API for the IT User Management System.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Brevo API** - Email service
- **dotenv** - Environment variables

## Setup

1. **Install dependencies**

   ```
   npm install
   ```

2. **Configure environment variables**

   ```
   cp .env.example .env
   ```

3. **Start development server**

   ```
   npm run dev
   ```

4. **Start production server**
   ```
   npm start
   ```

## API Routes

- **Auth**: `/api/v1/auth/*` - Authentication endpoints
- **Users**: `/api/v1/users/*` - User management endpoints
- **Health**: `/health` - Server health check

## Database

PostgreSQL database with schema defined in `database/schema.sql`

## Deployment

See `DEPLOY.md` for deployment instructions on Render.
