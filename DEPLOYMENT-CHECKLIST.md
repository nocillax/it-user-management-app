# Deployment Checklist

This checklist ensures that all required environment variables and configurations are set correctly when deploying the application.

## Frontend Deployment (Vercel)

- [ ] Set `VITE_API_URL` environment variable to `https://it-user-management-app.onrender.com/api/v1`
- [ ] Set `VITE_APP_NAME` environment variable to "IT User Management System"
- [ ] Set `VITE_APP_VERSION` environment variable to the current version

## Backend Deployment (Render)

- [ ] Set `NODE_ENV` to `production`
- [ ] Set `PORT` to match the port Render uses (usually automatic)
- [ ] Set `DATABASE_URL` to the PostgreSQL connection string provided by Render
- [ ] Set `JWT_SECRET` to a secure random string (use `openssl rand -base64 32`)
- [ ] Set `JWT_EXPIRES_IN` to the desired expiration time (e.g., `7d`)
- [ ] Set `FRONTEND_URL` to `https://nocillax-it-ums.vercel.app` (without trailing slash)
- [ ] Set `BCRYPT_ROUNDS` to `12`
- [ ] Set `EMAIL_PROVIDER` to `brevo`
- [ ] Set `BREVO_API_KEY` to your Brevo API key
- [ ] Set `EMAIL_FROM_NAME` to the sender name
- [ ] Set `EMAIL_FROM_ADDRESS` to the sender email address

## Troubleshooting

### CORS Issues

If you encounter CORS errors:
1. Check that `FRONTEND_URL` is set correctly in the backend environment variables
2. Verify that the frontend is using the correct API URL
3. Look at the server logs to see if the CORS origin is being recognized
4. Check the Network tab in browser devtools for CORS errors

### Database Issues

If you encounter database connection issues:
1. Verify the database connection string is correct
2. Check that the database server is running
3. Ensure the database user has the necessary permissions
4. Check that the schema has been properly applied

### Authentication Issues

If authentication is not working:
1. Check that JWT_SECRET is set correctly
2. Verify the expiration time is appropriate
3. Check that the frontend is sending the token correctly
4. Look for any error messages in the server logs