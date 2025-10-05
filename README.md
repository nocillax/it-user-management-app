# IT User Management System

A full-stack user management application built with the PERN stack (PostgreSQL, Express, React, Node.js) for managing user authentication, registration, and administrative tasks.

## Features

- **User Authentication**: Registration, login, email verification, and JWT-based sessions
- **User Management**: View, block, unblock, and delete users with bulk operations
- **Admin Dashboard**: Professional interface with sortable tables, filtering, and search
- **Email Verification**: Automated email verification system with Brevo API integration
- **Security**: Password hashing, JWT tokens, rate limiting, and input validation
- **Responsive Design**: Modern UI with TailwindCSS that works on all devices
- **User Status Persistence**: Remembers previous status when blocking/unblocking users

## Tech Stack

### Frontend

- **React** - User interface library
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **TanStack Table** - Data table management
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Brevo (SendInBlue)** - Email service integration
- **CORS** - Cross-origin resource sharing

### Database

- **PostgreSQL** - Primary database with UUID primary keys
- **Custom schemas** - User status enums, indexes, and constraints

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Database connection
│   │   ├── middleware/
│   │   │   └── auth.js           # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js           # Authentication routes
│   │   │   └── users.js          # User management routes
│   │   ├── utils/
│   │   │   ├── emailService.js   # Email sending service
│   │   │   └── helpers.js        # Utility functions
│   │   ├── migrations/
│   │   │   └── add-previous-status.js  # User status migration
│   │   └── server.js             # Express server setup
│   ├── database/
│   │   └── schema.sql            # Database schema
│   ├── docs/                     # Project documentation
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # Authentication components
│   │   │   └── Dashboard.jsx     # Main dashboard
│   │   ├── utils/
│   │   │   └── api.js            # API utilities
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # React entry point
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd it-user-management-app
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb user_management

# Import schema
psql user_management < backend/database/schema.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration:
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
# - JWT_SECRET (generate a secure random string)
# - BREVO_API_KEY, EMAIL_FROM_NAME, EMAIL_FROM_ADDRESS
# - FRONTEND_URL (http://localhost:5173)

# Start development server
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with:
# VITE_API_URL=http://localhost:5000/api/v1

# Start development server
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1

## Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:5173

# Email Configuration (Brevo)
EMAIL_PROVIDER=brevo
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM_NAME=IT User Management
EMAIL_FROM_ADDRESS=no-reply@example.com
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1

# App Configuration
VITE_APP_NAME="IT User Management System"
VITE_APP_VERSION="1.0.0"
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/verify/:token` - Email verification
- `POST /api/v1/auth/refresh` - Token refresh

### User Management

- `GET /api/v1/users` - List users (with pagination/filtering)
- `PATCH /api/v1/users/block` - Block selected users
- `PATCH /api/v1/users/unblock` - Unblock selected users
- `DELETE /api/v1/users/delete` - Delete selected users
- `DELETE /api/v1/users/delete-unverified` - Delete unverified users
- `GET /api/v1/users/stats` - User statistics

## Production Deployment

### Build Frontend

```bash
cd frontend
npm run build
```

### Start Production Backend

```bash
cd backend
npm start
```

### Environment Considerations

- Update CORS origins for production domains
- Use secure JWT secrets (32+ characters)
- Configure production database
- Enable HTTPS
- Set up proper logging

## 🚀 Deployment Guide

### Method 1: Render + Vercel (Recommended)

#### Backend Deployment (Render)

1. **Create Render Account**: [render.com](https://render.com)
2. **Create New Web Service**: Connect your GitHub repo
3. **Settings**:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
4. **Environment Variables**:
   ```
   NODE_ENV=production
   JWT_SECRET=your-long-random-secret
   BREVO_API_KEY=your_brevo_api_key
   EMAIL_FROM_NAME=IT User Management
   EMAIL_FROM_ADDRESS=no-reply@example.com
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. **Add PostgreSQL Database**: Render → Create → PostgreSQL
6. **Copy DATABASE_URL**: Add to environment variables

#### Frontend Deployment (Vercel)

1. **Create Vercel Account**: [vercel.com](https://vercel.com)
2. **Import Project**: Connect GitHub repo
3. **Root Directory**: `frontend`
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.render.com/api/v1
   ```
5. **Deploy**: Automatic deployment on git push

### Method 2: Railway (Full-Stack)

1. **Create Railway Account**: [railway.app](https://railway.app)
2. **Deploy from GitHub**: One-click deployment
3. **Add PostgreSQL**: Railway → Add Service → PostgreSQL
4. **Set Environment Variables**: Same as above

## 📋 Post-Deployment Checklist

- [ ] Backend health check: `GET /api/v1/health`
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout functionality
- [ ] User management features
- [ ] Database operations work

## License

MIT License - see LICENSE file for details