# Railway Deployment - Quick Start

## Option 1: Deploy via GitHub (Recommended)

### Step 1: Create GitHub Repository
```bash
# Make sure you're in the admin portal directory
cd /home/ubuntu/generator-admin-portal

# If repo doesn't exist, create it on GitHub first
# Then push code:
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `generator-admin-portal`
6. Railway will auto-detect and build

### Step 3: Add Environment Variables
In Railway Dashboard:
1. Go to your project
2. Click "Variables"
3. Add:
   ```
   SUPABASE_URL=https://nnaakuspoqjdyzheklyb.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   NODE_ENV=production
   ```

### Step 4: Deploy
- Click "Deploy"
- Wait for build to complete
- Get your URL from the deployment

---

## Option 2: Deploy via Railway CLI

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Initialize Project
```bash
cd /home/ubuntu/generator-admin-portal
railway init
```

### Step 4: Add Environment Variables
```bash
railway variables set SUPABASE_URL=https://nnaakuspoqjdyzheklyb.supabase.co
railway variables set SUPABASE_KEY=your_supabase_anon_key
railway variables set NODE_ENV=production
```

### Step 5: Deploy
```bash
railway up
```

Railway will provide your live URL.

---

## Expected URL Format
```
https://generator-admin-portal-production.up.railway.app
```

## After Deployment

1. **Test Login:**
   - Go to your Railway URL
   - Use your Supabase admin credentials

2. **Check Logs:**
   - Railway Dashboard → Deployments → View Logs

3. **Monitor:**
   - Railway Dashboard → Analytics

## Troubleshooting

**Build fails:**
- Check build logs in Railway
- Verify package.json has all dependencies
- Ensure Node version is compatible

**App crashes:**
- Check environment variables
- Review application logs
- Verify Supabase credentials

**Port issues:**
- Railway sets PORT automatically
- Don't hardcode port in production

## Support

- Railway Docs: https://docs.railway.app
- Railway Support: https://railway.app/support
