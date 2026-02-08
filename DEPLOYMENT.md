# Deployment Guide - Blood Donor Management System

## Prerequisites
- GitHub account
- Render account (free tier available at [render.com](https://render.com))
- Your Gemini API key

## Deployment Steps

### 1. Prepare Your Repository

#### Option A: Create a New GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `blood-donor-system` (or your preferred name)
3. **Do NOT initialize with README** (we already have files)

#### Option B: Initialize Git Locally
```bash
cd C:\Users\dhill\.gemini\antigravity\scratch\blood-donor-system
git init
git add .
git commit -m "Initial commit - Blood Donor Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/blood-donor-system.git
git push -u origin main
```

### 2. Deploy to Render

#### Step 2.1: Connect Repository
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your `blood-donor-system` repository

#### Step 2.2: Configure Service
Render will auto-detect the `render.yaml` configuration. Verify these settings:

- **Name**: `blood-donor-system`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free`

#### Step 2.3: Add Environment Variables
In the Render dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | Your actual Gemini API key |
| `SESSION_SECRET` | Generate a random string (see below) |

**Generate SESSION_SECRET:**
```bash
# On Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Or use any random string generator (32+ characters)
```

#### Step 2.4: Configure Persistent Disk
1. In the Render service settings, go to **"Disks"**
2. Click **"Add Disk"**
3. Configure:
   - **Name**: `sqlite-data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: `1 GB` (free tier)
4. Save changes

#### Step 2.5: Deploy
1. Click **"Create Web Service"**
2. Render will automatically build and deploy your application
3. Wait for deployment to complete (usually 2-5 minutes)

### 3. Verify Deployment

Once deployed, you'll receive a URL like: `https://blood-donor-system-xxxx.onrender.com`

#### Test the following:
1. **Health Check**: Visit `https://your-app.onrender.com/api/health`
   - Should return: `{"status":"healthy","timestamp":"...","environment":"production"}`

2. **Homepage**: Visit `https://your-app.onrender.com`
   - Should load the main page

3. **Register**: Create a test donor account
   - Verify registration works

4. **AI Assistant**: Test the health assistant
   - Verify Gemini API integration works

## Important Notes

### Database Persistence
- The SQLite database is stored on the persistent disk at `/opt/render/project/src/data`
- Data will persist across deployments and restarts
- **Free tier limitation**: Disk is deleted after 90 days of inactivity

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds to wake up
- 750 hours/month of runtime (sufficient for testing)

### WebSocket Support
- Render's free tier supports WebSocket connections
- Real-time updates will work in production

## Troubleshooting

### Build Fails
- Check that all dependencies are in `dependencies` (not `devDependencies`)
- Verify Node.js version compatibility (requires >=18.0.0)

### Database Errors
- Ensure persistent disk is properly configured
- Check that `DB_PATH` environment variable is set correctly

### Session Issues
- Verify `SESSION_SECRET` is set in environment variables
- Check that cookies are enabled in browser

### AI Assistant Not Working
- Verify `GEMINI_API_KEY` is correctly set
- Check API key has proper permissions
- Review Render logs for API errors

## Updating Your Deployment

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically detect the push and redeploy.

## Monitoring

- **Logs**: View real-time logs in Render Dashboard → Your Service → Logs
- **Metrics**: Monitor CPU, memory usage in the Metrics tab
- **Health**: Render automatically monitors `/api/health` endpoint

## Next Steps

After successful deployment:
1. Share the production URL with users
2. Monitor application logs for errors
3. Set up custom domain (optional, requires paid plan)
4. Consider upgrading to paid plan for:
   - No spin-down
   - More resources
   - Custom domains
   - Longer disk retention
