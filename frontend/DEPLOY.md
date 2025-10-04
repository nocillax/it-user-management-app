# IT User Management Frontend - Vercel Deploy

## Auto-Deploy from Git

This frontend is configured for deployment on Vercel.com

### Environment Variables (Set in Vercel Dashboard):

```
VITE_API_URL=https://your-backend-app.render.com/api/v1
```

### Build Settings:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Deployment Steps:

1. Push code to GitHub/GitLab
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### Notes:

- Vercel automatically detects Vite configuration
- Environment variables must start with VITE\_ prefix
- Update VITE_API_URL after backend is deployed
