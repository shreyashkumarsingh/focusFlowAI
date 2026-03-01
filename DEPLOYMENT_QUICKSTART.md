# FocusFlow Public Deployment - Quick Start Checklist

This document provides a streamlined checklist for deploying FocusFlow to production on Render.com for public use.

---

## TL;DR - Deploy in 30 Minutes

**Prerequisites (5 min):**
```bash
# 1. Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" > /tmp/jwt.txt
# Save this value

# 2. Push to GitHub
git add .
git commit -m "Ready for production deployment"
git push origin main
```

**Deployment (25 min):**
1. Create MongoDB Atlas cluster (5 min)
2. Deploy 3 services on Render (15 min)
3. Test public access (5 min)

---

## 1. MongoDB Setup (5 minutes)

### Quick Steps:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or login
3. **Create Cluster:**
   - Provider: AWS
   - Region: US-EAST-1
   - Tier: M0 (Free)
   - Click "Create"
   - ⏳ Wait 1-3 minutes...

4. **Collect Info:**
   - Click "Browse Collections" → Get connection string
   - Should look like: `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/...`
   - **Copy and save MONGO_URI**

### Network Access:
- Click "Network Access"
- Add IP: `0.0.0.0/0` (Allow anywhere)
- Confirm

---

## 2. Render Setup (25 minutes)

### 2A. Create Backend Service (5 min)

1. Go to https://render.com → Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository `FocusFlow`
4. Configure:
   - **Name**: `focusflow-api`
   - **Environment**: Node
   - **Build**: `npm install`
   - **Start**: `npm start`
   - **Root Dir**: `server`

5. **Environment Variables** (click "Environment"):
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGO_URI` = (paste from MongoDB Atlas)
   - `JWT_SECRET` = (paste generated secret)

6. Click **"Create Web Service"**
7. **⏳ Wait for deployment** (watch logs)
8. Once deployed, **copy the URL** (e.g., `https://focusflow-api.onrender.com`)

### 2B. Create ML Service (5 min)

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub `FocusFlow`
3. Configure:
   - **Name**: `focusflow-ml`
   - **Environment**: Python 3
   - **Build**: `pip install -r requirements.txt`
   - **Start**: `gunicorn --bind 0.0.0.0:5001 --workers 2 --timeout 60 app:app`
   - **Root Dir**: `ml-service`

4. **Environment Variables**:
   - `FLASK_ENV` = `production`
   - `PORT` = `5001`

5. Click **"Create Web Service"**
6. **⏳ Wait for deployment**
7. **Copy the ML URL** (e.g., `https://focusflow-ml.onrender.com`)

### 2C. Update Backend with ML URL (1 min)

1. Go back to **Backend Service** settings
2. Click "Environment"
3. Add: `ML_SERVICE_URL` = (paste ML URL from step 2B)
4. Add: `CLIENT_URL` = (leave empty for now)
5. Click Save (auto-redeploys)

### 2D. Create Frontend Service (5 min)

1. Click **"New +"** → **"Static Site"** (important: NOT "Web Service")
2. Connect GitHub `FocusFlow`
3. Configure:
   - **Name**: `focusflow-web`
   - **Build**: `npm install && npm run build`
   - **Publish**: `client/dist`

4. **Environment Variables**:
   - `VITE_API_URL` = `https://focusflow-api.onrender.com/api`
   - `VITE_ML_SERVICE_URL` = `https://focusflow-ml.onrender.com`

5. Click **"Create Static Site"**
6. **⏳ Wait for deployment**
7. **Copy Frontend URL** (e.g., `https://focusflow-web.onrender.com`)

### 2E. Final Backend Update (1 min)

1. Go to **Backend Service** settings
2. Click "Environment"
3. Update: `CLIENT_URL` = (paste frontend URL)
4. Click Save

---

## 3. Test Public Access (5 minutes)

### 3A. Frontend Test

1. Open browser: `https://focusflow-web.onrender.com`
2. You should see the login page
3. Click **"Signup"**
4. Create account:
   - Email: `test@focusflow.com`
   - Password: `TestPass123!`
5. Submit
6. Should redirect to Dashboard
7. ✅ **Success!**

### 3B. Create Test Task

1. On Dashboard, click **"Create Task"**
2. Enter: "Test task from public deployment"
3. Click **"Create"**
4. Verify it shows in task list
5. ✅ **Success!** Data is saving to MongoDB

### 3C. Test Dark Mode

1. Click profile icon (top right)
2. Toggle dark/light mode
3. Verify colors change and everything visible
4. ✅ **Success!**

### 3D. Test Analytics (if implemented)

1. Click **"Analytics"** in sidebar
2. Verify statistics display
3. Check dark mode works
4. ✅ **Success!**

---

## 4. Live Verification Checklist

- [ ] Frontend URL loads without errors
- [ ] Backend API responds to requests
- [ ] ML Service is accessible
- [ ] Can create user account
- [ ] Can login with credentials
- [ ] Can create and save tasks
- [ ] Can view tasks in list
- [ ] Dark mode works correctly
- [ ] No console errors (F12 DevTools)
- [ ] Database is saving data

---

## 5. Share with Public

Your app is now LIVE! Share these links:

- **Public URL**: `https://focusflow-web.onrender.com`
- **How to use**:
  1. Go to site
  2. Click "Signup"
  3. Create account with email + password
  4. Start creating tasks!

---

## Monitoring

### Check Service Health

- **Backend**: https://focusflow-api.onrender.com/api/health
- **ML**: https://focusflow-ml.onrender.com/health
- **Frontend**: https://focusflow-web.onrender.com

### View Logs

In Render dashboard, click each service and scroll to "Logs" to see:
- Deployment status
- Error messages
- Server startup info

### Set Alerts

In Render dashboard → Settings → Alerts:
- Email when deployment fails
- Email when service crashes
- Email when high resource usage

---

## Auto-Deploy from GitHub

Every time you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

All services automatically redeploy within 2-3 minutes! 🚀

---

## Important Notes

### DO:
- ✅ Keep `MONGO_URI` and `JWT_SECRET` in Render environment (not in GitHub)
- ✅ Test all features before sharing with users
- ✅ Monitor logs the first week
- ✅ Backup database regularly
- ✅ Keep dependencies updated

### DON'T:
- ❌ Never commit `.env` files to GitHub
- ❌ Never put secrets in code
- ❌ Never share your environment variables
- ❌ Never ignore error messages

---

## Troubleshooting

### Services Won't Start

**Solution**: Check logs in Render dashboard
1. Click service name
2. Scroll to "Logs"
3. Look for red error messages
4. Fix in code, commit, push GitHub
5. Render auto-redeploys

### Frontend Shows Blank Page

**Solution**: Check browser DevTools (F12)
1. Open Console tab
2. Look for red error messages
3. Usually VITE_API_URL is incorrect
4. Fix in Render environment variables

### Can't Create Account

**Solution**: MongoDB connection issue
1. Check `MONGO_URI` is correct
2. Check MongoDB Atlas network access allows 0.0.0.0/0
3. Test connection using MongoDB Atlas dashboard

---

## Upgrade to Paid (Optional)

Free tier is great for testing. For production:

1. Go to service settings
2. Click "Plan"
3. Upgrade to "Starter" ($7/month per service)
4. Benefits:
   - Always running (no spin-down)
   - Better performance
   - More resources

---

## Next Steps

1. ✅ **Deployed**: FocusFlow is live!
2. → Monitor error logs
3. → Collect user feedback
4. → Plan improvements
5. → Scale as needed

---

## Support

**Need help?**

See detailed guides:
- [MongoDB Setup Guide](./MONGODB_SETUP.md) - Database configuration
- [Render Deployment Guide](./RENDER_DEPLOYMENT.md) - Full deployment details
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment QA

---

## Summary

**What you've accomplished:**

| Component | Status |
|-----------|--------|
| Database | ✅ MongoDB Atlas |
| Backend API | ✅ Running on Render |
| ML Service | ✅ Running on Render |
| Frontend | ✅ Running on Render |
| Public Access | ✅ Live |
| Open Registration | ✅ Enabled |
| Task Management | ✅ Working |
| Data Persistence | ✅ MongoDB |

**FocusFlow is production-ready and publicly accessible!** 🎉

---

**Questions?** Check the detailed guides or see troubleshooting section above.
