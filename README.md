# IT User Management System

A full-stack user management application built with the PERN stack for managing user authentication, registration, and administrative tasks.

## 🚀 Live Demo

- **Frontend**: [Deploy on Vercel](https://vercel.com)
- **Backend**: [Deploy on Render](https://render.com)

## 📦 Quick Deploy Guide

### Option 1: Render + Vercel (Recommended)

1. **Backend on Render**: Deploy Node.js + PostgreSQL
2. **Frontend on Vercel**: Deploy React app

### Option 2: Alternative Free Hosts

- **Railway** (Full-stack)
- **Netlify** (Frontend) + **Render** (Backend)
- **Heroku** (Full-stack - requires credit card)

See deployment instructions below ⬇️

## Features

- **User Authentication**: Registration, login, email verification, and JWT-based sessions
- **User Management**: View, block, unblock, and delete users with bulk operations
- **Admin Dashboard**: Professional interface with sortable tables, filtering, and search
- **Email Verification**: Automated email verification system with SMTP integration
- **Security**: Password hashing, JWT tokens, rate limiting, and input validation
- **Responsive Design**: Modern UI with TailwindCSS that works on all devices

## Tech Stack

### Frontend

- **React 19** - User interface library
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
- **Nodemailer** - Email service integration
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
│   │   └── server.js             # Express server setup
│   ├── database/
│   │   └── schema.sql            # Database schema
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
# - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
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
- Backend API: http://localhost:5000

## Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (Gmail SMTP example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# URLs
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api/v1
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
- Set up proper email service (SendGrid, AWS SES, etc.)
- Enable HTTPS
- Set up proper logging

## 🚀 Deployment Guide

### Method 1: Render + Vercel (Free)

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
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
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

### Method 3: Local with ngrok (Development)

```bash
# Install ngrok
npm install -g ngrok

# Start backend
cd backend && npm run dev

# In new terminal, expose backend
ngrok http 5000

# Start frontend with ngrok URL
cd frontend && VITE_API_URL=https://abc123.ngrok.io/api/v1 npm run dev
```

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
