# IT User Management System

A comprehensive user management system built with the PERN stack (PostgreSQL, Express.js, React, Node.js) and TailwindCSS.

## 🔧 Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React (Vite) + TailwindCSS
- **Database**: PostgreSQL
- **Authentication**: JWT-based
- **Email**: Nodemailer (Gmail SMTP)

## 📋 Features

- User registration with email verification
- JWT-based authentication
- User management dashboard with:
  - Sortable user table
  - Bulk operations (block, unblock, delete)
  - User status management
  - Responsive design
- Email verification system
- Professional, clean UI design

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Gmail account (for email functionality)

### 1. Database Setup

1. Create PostgreSQL database:

```sql
CREATE DATABASE user_management;
```

2. Run the schema:

```bash
psql -d user_management -f backend/database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file with your configuration:

- Database credentials
- JWT secret (use a strong random string)
- Gmail SMTP credentials

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

### 4. Start Development Servers

**Backend** (Terminal 1):

```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📧 Email Configuration

For email functionality, configure Gmail SMTP:

1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
3. Use this password in your `.env` file as `EMAIL_PASS`

## 🗄️ Database Schema

The system uses a single `users` table with proper constraints and indexes for performance.

## 🔐 User Flow

1. **Registration**: User registers → receives verification email
2. **Verification**: User clicks email link → account activated
3. **Login**: User logs in → receives JWT token
4. **Dashboard**: Authenticated users can manage all users

## 🎨 UI Features

- Clean, professional design
- Responsive layout (mobile + desktop)
- TailwindCSS for styling
- Sortable table columns
- Bulk selection and operations
- Inline success/error messages

## 🔧 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/verify/:token` - Email verification

### User Management

- `GET /api/v1/users` - List users (with pagination/sorting)
- `PATCH /api/v1/users/block` - Block users
- `PATCH /api/v1/users/unblock` - Unblock users
- `DELETE /api/v1/users/delete` - Delete users
- `DELETE /api/v1/users/delete-unverified` - Delete unverified users
