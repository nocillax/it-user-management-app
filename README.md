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

- **React 18** - User interface library
- **Vite 5** - Build tool and development server
- **React Router 6** - Client-side routing
- **TailwindCSS 3** - Utility-first CSS framework
- **TanStack Table 8** - Data table management
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library
- **React Hook Form** - Form validation
- **React Toastify** - Toast notifications

### Backend

- **Node.js 18+** - JavaScript runtime
- **Express.js 4** - Web application framework
- **PostgreSQL 15** - Relational database
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Brevo (SendInBlue)** - Email service integration
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

### Database

- **PostgreSQL** - Primary database with UUID primary keys
- **Custom schemas** - User status enums, indexes, and constraints

## Project Structure

```
├── backend/               # Express API server
│   ├── database/          # Database schema and migrations
│   └── src/               # Server source code
│       ├── config/        # Configuration files
│       ├── middleware/    # Express middleware
│       ├── routes/        # API routes
│       └── utils/         # Utility functions
│
└── frontend/              # React client application
    ├── public/            # Static assets
    └── src/               # Frontend source code
        ├── components/    # React components
        ├── utils/         # Frontend utilities
        └── assets/        # Images and other assets
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/nocillax/it-user-management-app.git
cd it-user-management-app
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database and email service credentials
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Update .env with your backend API URL
npm run dev
```

### 4. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:10000/api/v1

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/verify/:token` - Email verification
- `POST /api/v1/auth/refresh` - Token refresh

### User Management

- `GET /api/v1/users` - List users (with pagination/filtering)
- `PATCH /api/v1/users/block` - Block selected users
- `PATCH /api/v1/users/unblock` - Unblock selected users
- `DELETE /api/v1/users/delete` - Delete selected users
- `DELETE /api/v1/users/delete-unverified` - Delete unverified users
- `GET /api/v1/users/stats` - User statistics

## Deployment

This project is configured for deployment on:

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: PostgreSQL on Render

See the deployment guides in the `frontend/DEPLOY.md` and `backend/DEPLOY.md` files for detailed instructions.

## License

BY NoCiLLaX <3
