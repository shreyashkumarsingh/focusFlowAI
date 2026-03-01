# Render.com Deployment Guide for FocusFlow

## Overview
This guide walks through deploying FocusFlow on Render, a modern cloud platform that supports Node.js, Python, and static sites. All three services will be deployed:
1. **Backend API** (Node.js/Express)
2. **ML Service** (Python/Flask)
3. **Frontend** (React/Vite - Static Site)

---

## Prerequisites Checklist

Before starting, you need:
- [ ] GitHub account with repository
- [ ] GitHub repository with FocusFlow code pushed
- [ ] Render.com account created
- [ ] GitHub repository connected to Render
- [ ] MongoDB Atlas cluster created with connection string
- [ ] Strong JWT_SECRET generated (32+ characters)
- [ ] Understanding of environment variables

### Generate JWT_SECRET

```bash
# On macOS/Linux/Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:
```
a7f3e8d9b2c1f6e4a9d3c6b8e1f4a7d9c2b5e8a1f3d6c9b2e5a8f1d4
```

**Save this value** - you'll need it for Render environment variables.

---

## Step 1: Setup GitHub Repository

### Prepare Repository Structure

Ensure your repository has this structure:
```
FocusFlow/
├── server/               ← Backend API
│   ├── server.js
│   ├── package.json
│   ├── render.yaml
│   └── ...
├── ml-service/          ← ML Service
│   ├── app.py
│   ├── requirements.txt
│   ├── render.yaml
│   └── ...
├── client/              ← Frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   ├── render.yaml
│   └── ...
├── .env.example         ← Template (NO actual secrets)
├── .gitignore          ← Must exclude .env files
└── README.md
```

### Create .gitignore

Create `.gitignore` in root:
```
# Environment
.env
.env.local
.env.*.local
.env.production

# Dependencies
node_modules/
__pycache__/
*.pyc
venv/
.venv/

# Build
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log
```

### Commit and Push to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 2: Create Render Account & Connect GitHub

### Signup for Render
1. Visit [https://render.com](https://render.com)
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"** (recommended)
4. Authorize Render to access your GitHub account
5. Select your GitHub account and repositories to connect

### Grant Repository Access
1. In GitHub settings: Settings → Integrations → Authorized OAuth Apps
2. Find "Render" and click **"Authorize"**
3. Or authorize in Render dashboard after signup

---

## Step 3: Deploy Backend API (Node.js)

### Create New Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. **Connect repository**:
   - Find `FocusFlow` repository
   - Click **"Connect"**

### Configure Backend Service

**Basic Settings:**
- **Name**: `focusflow-api`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free` (to start)

**Advanced Settings:**
- **Root Directory**: `server`
- **Auto-deploy**: `Yes` (redeploy on git push)

### Add Environment Variables

Click **"Environment"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `5000` | Backend port |
| `MONGO_URI` | `mongodb+srv://...` | From MongoDB Atlas |
| `JWT_SECRET` | Your generated secret | Keep secure! |
| `ML_SERVICE_URL` | Will add after ML deployment | e.g., `https://focusflow-ml.onrender.com` |
| `CLIENT_URL` | Will add after frontend deployment | e.g., `https://focusflow-web.onrender.com` |

**✅ For now, add:** `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`
**⏳ Add ML/Client URLs after deploying those services**

### Deploy

Click **"Create Web Service"**

**Wait for deployment:**
- Logs should show: `npm install` → `npm start`
- Look for: `Server running on port 5000`
- Should take 2-3 minutes
- ❌ If errors appear, scroll to see why

**Save the backend URL**, e.g.: `https://focusflow-api.onrender.com`

### Verify Backend

Test in browser or terminal:
```bash
curl https://focusflow-api.onrender.com/api/health
```

Expected response:
```json
{"status":"ok"}
```

---

## Step 4: Deploy ML Service (Python)

### Create New Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. **Connect repository**: Select `FocusFlow`

### Configure ML Service

**Basic Settings:**
- **Name**: `focusflow-ml`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn --bind 0.0.0.0:5001 --workers 2 --timeout 60 app:app`
- **Plan**: `Free`

**Advanced Settings:**
- **Root Directory**: `ml-service`
- **Auto-deploy**: `Yes`

### Add Environment Variables

| Key | Value |
|-----|-------|
| `FLASK_ENV` | `production` |
| `FLASK_DEBUG` | `0` |
| `PORT` | `5001` |

### Deploy

Click **"Create Web Service"**

**Wait for deployment:**
- Should see: `pip install` → Flask startup
- Look for: `Listening on 0.0.0.0:5001`
- Takes 3-5 minutes (Python dependencies slower)

**Save the ML URL**, e.g.: `https://focusflow-ml.onrender.com`

### Verify ML Service

Test in browser:
```bash
curl https://focusflow-ml.onrender.com/health
```

Expected response:
```json
{"status":"healthy"}
```

---

## Step 5: Update Backend with ML Service URL

### Add ML_SERVICE_URL

1. Go to **Backend Service** in Render dashboard
2. Click **"Environment"**
3. Add: `ML_SERVICE_URL` = `https://focusflow-ml.onrender.com`
4. Click **"Save"**
5. Service auto-redeploys with new env var

---

## Step 6: Deploy Frontend (React + Vite)

### Create Static Site Service

1. In Render dashboard, click **"New +"**
2. Select **"Static Site"** (NOT Web Service)
3. **Connect repository**: Select `FocusFlow`

### Configure Frontend Service

**Basic Settings:**
- **Name**: `focusflow-web`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `client/dist`
- **Plan**: `Free`

**Advanced Settings:**
- **Auto-deploy**: `Yes`

### Add Environment Variables

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://focusflow-api.onrender.com/api` |
| `VITE_ML_SERVICE_URL` | `https://focusflow-ml.onrender.com` |

### Deploy

Click **"Create Static Site"**

**Wait for deployment:**
- Should see: `npm install` → `npm run build` → `dist` folder published
- Takes 2-3 minutes
- ✅ You'll get a URL like: `https://focusflow-web.onrender.com`

**Save the frontend URL**: `https://focusflow-web.onrender.com`

---

## Step 7: Update Backend with Frontend URL

### Add CLIENT_URL

1. Go to **Backend Service** in Render dashboard
2. Click **"Environment"**
3. Add: `CLIENT_URL` = `https://focusflow-web.onrender.com`
4. Click **"Save"**
5. Service auto-redeploys

---

## Step 8: Verify Full Stack Deployment

### Test All Services

**1. Check Backend Status:**
```bash
curl https://focusflow-api.onrender.com/api/health
```

**2. Check ML Service Status:**
```bash
curl https://focusflow-ml.onrender.com/health
```

**3. Check Frontend:**
Open `https://focusflow-web.onrender.com` in browser

### Test Authentication Flow

1. Open frontend URL in browser
2. Go to **Signup** page
3. Create new account with:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
4. Should redirect to **Dashboard**
5. Click **"Create Task"**
6. Add a task: "Fix deployment"
7. Verify it saves and displays

### Test API Directly (Optional)

```bash
# Signup
curl -X POST https://focusflow-api.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'

# Response should include JWT token
```

---

## Step 9: Setup Custom Domain (Optional)

### Add Custom Domain (Free)
1. Go to **Static Site** (Frontend) settings
2. Click **"Add Custom Domain"**
3. Enter domain: `focusflow.example.com`
4. Follow DNS setup instructions
5. Wait for verification (5-30 minutes)

---

## Step 10: Configure Auto-Deployment

### GitHub Push Auto-Deploy

All services should be set to auto-deploy on push. Verify:

1. For each service in Render:
   - Click service name
   - Go to **Settings**
   - Check "Auto-deploy" is **"Yes"**

2. When you push to GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
   - **Backend** redeploys automatically
   - **ML Service** redeploys automatically
   - **Frontend** redeploys automatically

---

## Step 11: Monitor Deployments

### View Service Logs

1. Click service name in dashboard
2. Scroll to **"Logs"** section
3. See real-time deployment output
4. Check for errors during build/startup

### Common Log Messages

**✅ Success indicators:**
- `Build finished successfully`
- `Server running on port 5000`
- `Listening on 0.0.0.0:5001`

**❌ Error indicators:**
- `ERR!` or `npm error`
- `SyntaxError` or `ImportError`
- `Connection refused`

### View Metrics

Click **"Metrics"** to monitor:
- CPU usage
- Memory usage
- Response times
- Requests per minute
- Error rates

---

## Step 12: Post-Deployment Checklist

- [ ] All three services deployed and running
- [ ] No errors in service logs
- [ ] Frontend loads in browser
- [ ] Can create user account
- [ ] Can login with credentials
- [ ] Can create and save tasks
- [ ] Analytics page displays correctly
- [ ] Dark mode works
- [ ] ML features work (if implemented)
- [ ] Database backup operational

---

## Troubleshooting

### Backend Won't Start

**Common Issues:**

| Error | Solution |
|-------|----------|
| `cannot find module` | Missing `require()` or import statement |
| `ENOENT: no such file` | Wrong root directory (check render.yaml) |
| `MongoError` | MONGO_URI invalid or network access not allowed |
| `JWT_SECRET not set` | Missing env variable in Render dashboard |

**Debugging:**
1. Check **Logs** for exact error
2. Search error message online
3. Fix in code, commit, push
4. Render auto-redeploys

### Frontend Shows Blank Page

| Issue | Solution |
|-------|----------|
| 404 Not Found | Check build succeeded, `dist/` exists |
| Cannot POST/GET data | API_URL env var incorrect |
| Dark mode broken | CSS not loading (build issue) |

**Debug:**
1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab for failed requests
4. Verify API_URL in Network requests

### ML Service Times Out

| Issue | Solution |
|-------|----------|
| Gunicorn errors | Check Python syntax |
| Port already in use | Use PORT=5001 env var |
| Slow predictions | Upgrade to paid Render plan |

---

## Free vs. Paid Plans

### Free Tier Limitations
- Services spin down after 15 min inactivity
- ~50 hour/month run time
- 512 MB RAM
- Shared CPU
- Good for testing/demo

### Upgrade to Paid (Recommended for Production)
- **Starter**: $7/month per service
- Always running (no spin-down)
- 1 GB RAM
- Dedicated CPU
- 3 services = $21/month total
- Upgrade anytime in settings

---

## Monitoring & Alerts

### Enable Alert Notifications

1. Go to **Dashboard Settings**
2. Click **"Alerts"**
3. Add email for:
   - Deployment failures
   - Service crashes
   - High CPU/memory usage

### Set Up Monitoring

- **Uptime Monitoring**: Check status.render.com
- **Performance**: Monitor latency in Render dashboard
- **Cost**: View estimated costs (free tier = $0)

---

## Scaling (Future)

When traffic grows:

1. **Upgrade plans** to "Standard" ($25/month)
2. **Add CDN** for frontend (Render built-in)
3. **Scale database** to larger MongoDB tier
4. **Add caching** (Redis)
5. **Load balancing** across multiple services

---

## Useful Render Commands & Links

| Action | Location |
|--------|----------|
| View Dashboard | https://dashboard.render.com |
| View Logs | Service → Logs |
| View Metrics | Service → Metrics |
| Manage Env Vars | Service → Environment |
| Manage Domain | Service → Custom Domain |
| Check Status | https://status.render.com |

---

## Environment Variables Reference

**Backend (`server/`):**
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=<32+ char random string>
ML_SERVICE_URL=https://focusflow-ml.onrender.com
CLIENT_URL=https://focusflow-web.onrender.com
```

**ML Service (`ml-service/`):**
```
FLASK_ENV=production
FLASK_DEBUG=0
PORT=5001
```

**Frontend (`client/`):**
```
VITE_API_URL=https://focusflow-api.onrender.com/api
VITE_ML_SERVICE_URL=https://focusflow-ml.onrender.com
```

---

## Security Best Practices

1. **Never commit env variables** to GitHub
2. **Use strong JWT_SECRET** (32+ random characters)
3. **Enable GitHub branch protection** (settings)
4. **Rotate secrets** monthly
5. **Monitor access logs** regularly
6. **Use HTTPS only** (Render default)
7. **Keep dependencies updated**

---

## Support & Resources

- Render Docs: https://render.com/docs
- Troubleshooting: https://render.com/docs/troubleshooting
- Community: https://community.render.com
- Status: https://status.render.com

---

## Next Steps After Deployment

1. ✅ Share frontend URL with users
2. → Monitor for errors and performance issues
3. → Collect user feedback
4. → Plan feature improvements
5. → Scale infrastructure as needed

**Congratulations!** FocusFlow is now live on the internet! 🚀
