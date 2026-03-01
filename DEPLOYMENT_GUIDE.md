# FocusFlow Deployment Guide - Render.com

Complete step-by-step guide to deploy FocusFlow (Frontend, Backend, ML Service) to Render for public use.

---

## Architecture Overview

```
┌─────────────────────┐
│  Frontend (React)   │  → Hosted as Static Site on Render
│  Port: 3000/5173    │
└──────────┬──────────┘
           │
           ├─────────────────┬─────────────────┐
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌──────────────┐  ┌──────────────┐
    │   Backend   │   │  ML Service  │  │   MongoDB    │
    │  Express.js │   │     Flask    │  │    Atlas     │
    │ Port: 5000  │   │  Port: 5001  │  │   Database   │
    └─────────────┘   └──────────────┘  └──────────────┘
```

---

## Prerequisites

- [ ] GitHub account (for version control)
- [ ] Render.com account (free tier available)
- [ ] MongoDB Atlas account (free tier available)
- [ ] Node.js 18+ installed locally (for testing)
- [ ] Python 3.9+ installed locally (for ML service)

---

## Step 1: Setup MongoDB Atlas Database

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project: "FocusFlow"
4. Create a new cluster:
   - Select "Shared" (Free tier)
   - Region: Choose closest to your users
   - Cluster name: "focusflow-cluster"
5. Wait 3-5 minutes for cluster Creation

### 1.2 Setup Database User

1. Go to "Database Access"
2. Create a new user:
   - Username: `focusflow_user`
   - Password: Generate strong password (save it!)
   - Role: "readWriteAnyDatabase"
3. Click "Create User"

### 1.3 Get Connection String

1. Go to "Databases" → Click "Connect"
2. Select "Drivers" → Node.js
3. Copy MongoDB URI:
   ```
   mongodb+srv://focusflow_user:<PASSWORD>@focusflow-cluster.xxxxx.mongodb.net/focusflow?retryWrites=true&w=majority
   ```
4. Replace `<PASSWORD>` with your actual password
5. Save this as `MONGO_URI` for backend

### 1.4 Whitelist IPs (Important!)

1. Go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (for production, this is acceptable for a web app)
4. Click "Confirm"

---

## Step 2: Setup Render.com Services

### 2.1 Create Backend Service

1. Go to [Render.com](https://render.com)
2. Sign up or log in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** `focusflow-api`
   - **Region:** Oregon (US-West)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `server`
   - **Plan:** Free tier
6. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://focusflow_user:PASSWORD@focusflow-cluster.xxxxx.mongodb.net/focusflow?retryWrites=true&w=majority
   JWT_SECRET=generate_a_long_random_string_here_use_this_openssl_rand_32_-base64
   ML_SERVICE_URL=https://focusflow-ml.onrender.com
   CLIENT_URL=https://your-frontend-domain.onrender.com
   PORT=5000
   ```
7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy the deployed URL: `https://focusflow-api.onrender.com`

### 2.2 Create ML Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `focusflow-ml`
   - **Region:** Oregon (US-West)
   - **Environment:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:5001 app:app`
   - **Root Directory:** `ml-service`
   - **Plan:** Free tier
4. Add Environment Variables:
   ```
   FLASK_ENV=production
   PORT=5001
   ```
5. Click "Create Web Service"
6. Wait for deployment
7. Copy the deployed URL: `https://focusflow-ml.onrender.com`
8. **Important:** Go back to Backend service → Add `ML_SERVICE_URL` from ML service

### 2.3 Create Frontend Service (Static Site)

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `focusflow-web`
   - **Region:** Oregon (US-West)
   - **Build Command:** `cd client && npm install && npm run build`
   - **Publish Directory:** `client/dist`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://focusflow-api.onrender.com/api
   VITE_ML_SERVICE_URL=https://focusflow-ml.onrender.com
   ```
5. Click "Create Static Site"
6. Wait for deployment
7. Copy the deployed URL: `https://focusflow-web.onrender.com`

---

## Step 3: Update Backend CORS Configuration

Backend now has CORS configured to accept your frontend URL. When deploying:

1. Update `CLIENT_URL` environment variable in backend service
2. Restart backend service

---

## Step 4: Testing Deployment

### 4.1 Test Backend API

```bash
curl https://focusflow-api.onrender.com/
```

Expected response:
```json
{
  "service": "FocusFlowAI API",
  "status": "operational",
  "version": "3.0.0",
  "ai_enabled": true,
  "endpoints": {...}
}
```

### 4.2 Test Frontend

1. Visit: `https://focusflow-web.onrender.com`
2. Create a new account
3. Login
4. Create a task
5. Check if data persists (refresh page)

### 4.3 Test ML Service

```bash
curl -X POST https://focusflow-ml.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"tasks": [{"title": "Test", "status": "completed", "priority": "high"}]}'
```

---

## Step 5: Setup Custom Domain (Optional)

1. Buy a domain from Namecheap, GoDaddy, or similar
2. In Render dashboard:
   - Select Frontend service
   - Go to "Settings" → "Custom Domain"
   - Enter your domain
   - Follow DNS setup instructions
3. Update frontend environment variable with custom domain

---

## Environment Variables Checklist

### Backend (.env on Render)
```
NODE_ENV=production
MONGO_URI=mongodb+srv://... (from MongoDB Atlas)
JWT_SECRET=<generate with: openssl rand 32 -base64>
ML_SERVICE_URL=https://focusflow-ml.onrender.com
CLIENT_URL=https://focusflow-web.onrender.com
PORT=5000
```

### Frontend (build environment)
```
VITE_API_URL=https://focusflow-api.onrender.com/api
VITE_ML_SERVICE_URL=https://focusflow-ml.onrender.com
```

### ML Service (.env on Render)
```
FLASK_ENV=production
PORT=5001
```

---

## Monitoring & Logs

### View Logs
1. Go to each service in Render dashboard
2. Click "Logs" tab
3. Monitor for errors in real-time

### Useful Commands
```bash
# Backend logs
tail -f /var/log/app.log

# ML Service logs
journalctl -u app -f

# Check service status
pm2 status
```

---

## Common Issues & Solutions

### Issue: 502 Bad Gateway
**Solution:**
- Check if MONGO_URI is correct
- Verify MongoDB Atlas IP whitelist
- Check backend logs for connection errors
- Redeploy backend service

### Issue: CORS Errors
**Solution:**
- Verify `CLIENT_URL` environment variable matches frontend URL
- Check CORS configuration in `server.js`
- Clear browser cache and localStorage
- Hard refresh (Ctrl+Shift+R)

### Issue: ML Service Not Responding
**Solution:**
- Verify ML_SERVICE_URL in backend is correct
- Check if ML service is deployed successfully
- Check ML service logs for Python errors
- Ensure `gunicorn` is installed in requirements.txt

### Issue: "Cannot find module"
**Solution:**
- Ensure all dependencies in `package.json` are specified
- Run `npm install` locally and verify it works
- Check `node_modules` size (should not be in git)

### Issue: Database Connection Timeout
**Solution:**
- Add IP `0.0.0.0/0` to MongoDB Atlas whitelist
- Use full connection string with options
- Increase timeout in Mongoose config

---

## Performance Optimization

### For Backend
- Enable response compression: `app.use(compression())`
- Implement caching with Redis
- Use connection pooling (already done in Mongoose)

### For Frontend
- Use Vite's code splitting
- Lazy load routes with React.lazy()
- Optimize images and assets
- Enable gzip compression

### For ML Service
- Cache model predictions
- Batch process requests
- Implement request timeouts

---

## Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] CORS configured to specific domains only
- [ ] HTTPS enforced (Render does this automatically)
- [ ] MongoDB credentials strong and unique
- [ ] JWT secret is long and random (32+ characters)
- [ ] Rate limiting implemented (future)
- [ ] API key validation on ML endpoints (future)
- [ ] User input validation on all endpoints
- [ ] SQL injection prevention (using Mongoose ODM)
- [ ] OWASP top 10 compliance checklist done

---

## Scaling Tips (When Needed)

### Move from Free to Paid Tier
1. Render → Service → Settings → Plan
2. Upgrade as needed
3. Scaling Rules → Auto-scaling

### Database Scaling
1. MongoDB Atlas → Clusters → Upgrade tier
2. Add sharding if needed
3. Backup strategy

### CDN & Caching
1. Add Cloudflare in front of static site
2. Cache API responses
3. Implement pagination for large datasets

---

## Backup & Disaster Recovery

### Database Backup
1. MongoDB Atlas → Backup → Enable automatic backups (daily)
2. Test restore procedures monthly

### Code Recovery
1. GitHub is your backup (use git tags for releases)
2. Regular commits with meaningful messages
3. Feature branches for development

---

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

## Deployment Verification Checklist

Before marking deployment as complete:

- [ ] Frontend loads successfully
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] Can create tasks
- [ ] Tasks persist after refresh
- [ ] Analytics dashboard loads
- [ ] AI features work (predictions show up)
- [ ] Network requests go to deployed backend
- [ ] No 404 or CORS errors in console
- [ ] Mobile responsive design works
- [ ] Email notifications (if implemented) send
- [ ] Backend API responds to direct calls
- [ ] ML Service calculates predictions
- [ ] Database contains created data
- [ ] All environment variables are set

---

## Next Steps After Deployment

1. **Monitor performance** - Check Render metrics daily for first week
2. **Gather user feedback** - Release to users gradually
3. **Setup error tracking** - Implement Sentry or similar
4. **Implement analytics** - Track user behavior and features used5. **Plan feature roadmap** - Based on user feedback
6. **Setup CI/CD** - GitHub Actions to auto-deploy on push

---

**Questions? Issues?** Check the GitHub issues or create detailed bug reports!

Happy Deploying! 🚀
