# Deployment Guide

## Quick Deployment to Railway

### Prerequisites
- Railway account (free at railway.app)
- GitHub account
- Git CLI

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial admin portal setup"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/generator-admin-portal.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `generator-admin-portal` repository
6. Railway will auto-detect Node.js and build

### Step 3: Configure Environment Variables

In Railway Dashboard:
1. Go to your project
2. Click "Variables"
3. Add these variables:
   ```
   SUPABASE_URL=https://nnaakuspoqjdyzheklyb.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   NODE_ENV=production
   PORT=3000
   ```

### Step 4: Get Your URL

Once deployed:
1. Go to "Deployments"
2. Click the active deployment
3. Copy the Railway URL (e.g., `https://generator-admin-portal-production.up.railway.app`)

## Test Application Deployment

The test application is already deployed at:
- **URL:** https://teal-semolina-59c9d9.netlify.app
- **Status:** ✅ Live with fixed logo

## Monitoring

### Railway Dashboard
- View logs: Project → Deployments → View Logs
- Monitor usage: Project → Analytics
- Check health: Project → Status

### Common Issues

**Build fails:**
- Check build logs in Railway dashboard
- Verify all dependencies in package.json
- Ensure Node version compatibility

**App crashes:**
- Check environment variables are set
- Review application logs
- Verify Supabase credentials

**Port issues:**
- Railway auto-assigns PORT via environment variable
- Don't hardcode port in production

## Recovery Procedure

If deployment fails or you need to rebuild:

1. **Local rebuild:**
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   npm start
   ```

2. **Redeploy to Railway:**
   ```bash
   git add .
   git commit -m "Fix: [description]"
   git push origin main
   ```
   Railway will auto-redeploy on push.

3. **Manual redeploy:**
   - Railway Dashboard → Project → Deployments → Redeploy

## Scaling

As usage grows:
- Railway free tier includes 500 hours/month
- Upgrade to paid plan for production use
- Consider database optimization
- Add caching layer if needed

## Support

- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Track bugs and features
