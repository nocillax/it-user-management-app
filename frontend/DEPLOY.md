# IT User Management Frontend - Vercel Deployment

## Quick Deployment Steps

1. **Connect Repository**

   - Sign up/login to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Select "frontend" as the root directory

2. **Configure Settings**

   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**

   - Set `VITE_API_URL` to your Render backend URL (e.g., `https://your-app.onrender.com/api/v1`)

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your frontend

## Custom Domain Setup (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain and follow the DNS configuration instructions

## Automatic Deployments

Vercel automatically deploys when you push to your repository. To disable:

1. Go to project settings
2. Navigate to "Git"
3. Configure auto-deployment settings

## Monitoring

- Check your deployment logs in the Vercel dashboard
- Monitor build and runtime errors
- View analytics and performance metrics
