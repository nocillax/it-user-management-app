# IT User Management Backend - Render Deployment

## Quick Deployment Steps

1. **Create Web Service**

   - Sign up/login to [Render](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Settings**

   - **Name**: Choose a name for your service
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: If using monorepo, set to `/backend`

3. **Environment Variables**

   - `NODE_ENV=production`
   - `JWT_SECRET` (generate a secure random string)
   - `BREVO_API_KEY` (from your Brevo account)
   - `EMAIL_FROM_NAME` (display name for emails)
   - `EMAIL_FROM_ADDRESS` (sender email address)
   - `FRONTEND_URL` (your Vercel frontend URL)
   - `PORT=10000`

4. **Database Setup**

   - Create a PostgreSQL database in Render
   - Render will automatically add the `DATABASE_URL` to your service
   - Run the schema.sql in the PostgreSQL instance (via Render database shell)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the deployment to complete

## Health Check

Use the `/health` endpoint to verify your deployment is working correctly.

## Scaling (Optional)

1. Adjust the instance type in the settings
2. Enable auto-scaling for production workloads

## Monitoring

- View server logs in the Render dashboard
- Monitor performance metrics
- Set up alerts for critical errors
