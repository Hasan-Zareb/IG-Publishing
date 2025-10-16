# 🚂 Railway Deployment Guide

## Prerequisites
- Railway account (sign up at https://railway.app)
- GitHub account (for connecting your repository)

## Step 1: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)
1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Connect to Railway:**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect it's a Node.js app

### Option B: Deploy from CLI
1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

## Step 2: Configure Environment Variables

In your Railway dashboard, go to **Variables** and add these environment variables:

### Required Variables:
```
DATABASE_URL=postgresql://neondb_owner:npg_BkEAPtZoh74r@ep-fragrant-fog-a1yo0wp1-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=your_session_secret_here
INSTAGRAM_APP_ID=1276996324229787
INSTAGRAM_APP_SECRET=8ba6167ac03f504eb77ed05b6d7f9f4c
```

### Optional Variables:
```
NODE_ENV=production
PORT=5000
INSTAGRAM_REDIRECT_URI=https://your-app-name.up.railway.app/api/instagram/auth/callback
```

## Step 3: Update Meta Developer Portal

1. **Get your Railway domain:**
   - In Railway dashboard, go to **Settings** → **Domains**
   - Copy your Railway domain (e.g., `https://your-app-name.up.railway.app`)

2. **Update OAuth Redirect URI:**
   - Go to https://developers.facebook.com/
   - Select your app
   - Go to **Facebook Login** → **Settings**
   - Add this redirect URI:
     ```
     https://your-app-name.up.railway.app/api/instagram/auth/callback
     ```
   - Remove the localhost URI
   - Click **Save Changes**

## Step 4: Test Deployment

1. **Check deployment status:**
   - Go to Railway dashboard → **Deployments**
   - Wait for deployment to complete (green checkmark)

2. **Test endpoints:**
   ```bash
   curl https://your-app-name.up.railway.app/api/instagram/accounts
   ```

3. **Test OAuth flow:**
   - Visit: `https://your-app-name.up.railway.app`
   - Go to Instagram Accounts page
   - Click "Connect Instagram Account"

## Step 5: Database Migration

Run database migrations on Railway:
```bash
railway run npm run db:push
```

## Troubleshooting

### Common Issues:
1. **Build fails:** Check that all dependencies are in `package.json`
2. **Environment variables:** Ensure all required variables are set
3. **Database connection:** Verify `DATABASE_URL` is correct
4. **OAuth redirect:** Make sure Railway domain is added to Meta Developer Portal

### Logs:
- View logs in Railway dashboard → **Deployments** → **View Logs**
- Or use CLI: `railway logs`

### Restart deployment:
- In Railway dashboard → **Settings** → **Restart**

## Next Steps

After successful deployment:
1. Test Instagram OAuth connection
2. Test CSV import functionality
3. Deploy frontend to Firebase
4. Update frontend to use Railway backend URL
