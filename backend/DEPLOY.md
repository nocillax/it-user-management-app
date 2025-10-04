# IT User Management Backend - Render Deploy

## Auto-Deploy from Git

This backend is configured for deployment on Render.com

### Environment Variables (Set in Render Dashboard):

```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-long-random-jwt-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-frontend-app.vercel.app
PORT=10000
```

### Database Setup:

1. Render will provide PostgreSQL database URL
2. Update DATABASE_URL in environment variables
3. Database schema will auto-create on first run

### Build Command: `npm install`

### Start Command: `npm start`

### Health Check Endpoint: `/api/v1/health`
