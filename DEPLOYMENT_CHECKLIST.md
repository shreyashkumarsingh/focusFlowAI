# FocusFlow Production Deployment Checklist

## Pre-Deployment (Local Testing)

### Code Quality
- [ ] All console errors resolved
- [ ] No TypeScript compilation errors
- [ ] ESLint warnings reviewed and fixed
- [ ] Tests passing (if tests exist)
- [ ] Git uncommitted changes reviewed

### Database
- [ ] MongoDB connection works locally
- [ ] All models have proper validation
- [ ] Migration scripts tested (if any)
- [ ] Backup strategy documented

### Backend API
- [ ] All endpoints tested with Postman/Insomnia
- [ ] Error handling implemented
- [ ] Input validation on all routes
- [ ] CORS configuration reviewed
- [ ] Environment variables documented

### Frontend
- [ ] Build completes without warnings: `npm run build`
- [ ] No dead code or unused imports
- [ ] Environment variables for production set
- [ ] Mobile responsive design verified
- [ ] Dark mode tested thoroughly
- [ ] Loading states work correctly
- [ ] Error messages display properly

### ML Service
- [ ] All endpoints tested
- [ ] Requirements.txt up to date with exact versions
- [ ] Gunicorn installation verified
- [ ] Can start with: `gunicorn --bind 0.0.0.0:5001 app:app`

---

## MongoDB Atlas Setup

- [ ] Account created and verified
- [ ] Project "FocusFlow" created
- [ ] Cluster "focusflow-cluster" created (free tier)
- [ ] Database user created (`focusflow_user`)
- [ ] Strong password generated and saved
- [ ] Connection string obtained
- [ ] IP whitelist configured (0.0.0.0/0 for web app)
- [ ] Network access verified
- [ ] Backup enabled
- [ ] Monitoring set up

---

## Render.com Setup

### General
- [ ] Render account created
- [ ] GitHub account connected to Render
- [ ] Repository access granted

### Backend Service
- [ ] Web service created: `focusflow-api`
- [ ] Region set: US-West (Oregon)
- [ ] Root directory: `server`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `MONGO_URI=<valid connection string>`
  - [ ] `JWT_SECRET=<32+ character random string>`
  - [ ] `ML_SERVICE_URL=<from ML service>`
  - [ ] `CLIENT_URL=<from frontend>`
  - [ ] `PORT=5000`
- [ ] Service deployed successfully
- [ ] No deployment errors in logs
- [ ] URL copied: `https://focusflow-api.onrender.com`

### ML Service
- [ ] Web service created: `focusflow-ml`
- [ ] Region set: US-West (Oregon)
- [ ] Root directory: `ml-service`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `gunicorn --bind 0.0.0.0:5001 app:app`
- [ ] Environment variables set:
  - [ ] `FLASK_ENV=production`
  - [ ] `PORT=5001`
- [ ] Service deployed successfully
- [ ] No deployment errors in logs
- [ ] URL copied: `https://focusflow-ml.onrender.com`

### Frontend Service
- [ ] Static site created: `focusflow-web`
- [ ] Region set: US-West (Oregon)
- [ ] Build command: `cd client && npm install && npm run build`
- [ ] Publish directory: `client/dist`
- [ ] Environment variables set:
  - [ ] `VITE_API_URL=https://focusflow-api.onrender.com/api`
  - [ ] `VITE_ML_SERVICE_URL=https://focusflow-ml.onrender.com`
- [ ] Service deployed successfully
- [ ] No deployment errors in logs
- [ ] URL copied: `https://focusflow-web.onrender.com`

---

## Integration Testing

### Basic Connectivity
- [ ] Backend API responds: `curl https://focusflow-api.onrender.com/`
- [ ] Frontend loads in browser
- [ ] No 502 Bad Gateway errors
- [ ] No CORS errors in console

### Authentication
- [ ] Can create new account
- [ ] Email validation works (if implemented)
- [ ] Can login with correct credentials
- [ ] Login with wrong password fails
- [ ] Token stored in localStorage
- [ ] Logout clears token

### Task Management
- [ ] Can create a task
- [ ] Can list tasks
- [ ] Can update task status
- [ ] Can delete task
- [ ] Task changes persist after refresh
- [ ] Can filter by status/category
- [ ] Search functionality works

### Analytics
- [ ] Analytics page loads
- [ ] Statistics display correctly
- [ ] Burnout analysis shows
- [ ] Dark mode works
- [ ] Charts render properly

### AI Features
- [ ] Advanced Analytics page loads
- [ ] All tabs render
- [ ] Predictions show (even if demo data)
- [ ] No console errors for AI endpoints
- [ ] ML Service responds to requests

### Form Validation
- [ ] Empty fields rejected
- [ ] Email format validated
- [ ] Password requirements enforced
- [ ] File uploads work (if applicable)
- [ ] Form error messages display

---

## Performance Verification

### Frontend Performance
- [ ] Initial page load: < 3 seconds
- [ ] API responses: < 500ms
- [ ] No memory leaks (check DevTools)
- [ ] Smooth animations and transitions
- [ ] Mobile performance tested

### Backend Performance
- [ ] Response times logged
- [ ] No timeout errors
- [ ] Database queries optimized
- [ ] No N+1 queries detected

### ML Service Performance
- [ ] Predictions calculated < 1 second
- [ ] No Python errors in logs
- [ ] CPU usage reasonable

---

## Security Verification

### Secrets Management
- [ ] No secrets in GitHub repository
- [ ] All secrets in Render environment
- [ ] JWT secret is strong (32+ chars)
- [ ] No hardcoded API keys
- [ ] Database password complex

### API Security
- [ ] CORS configured correctly
- [ ] Only frontend domain allowed
- [ ] No sensitive data in URLs
- [ ] Passwords hashed (bcrypt)
- [ ] Input sanitized on all endpoints
- [ ] Rate limiting considered (future)

### Frontend Security
- [ ] No sensitive data in localStorage (only token)
- [ ] XSS protection in place (React default)
- [ ] HTTPS only (Render default)
- [ ] No inline scripts

### Database Security
- [ ] Strong authentication credentials
- [ ] IP whitelist configured
- [ ] No direct DB access exposed
- [ ] Backups enabled

---

## Monitoring & Logging

### Render Dashboard
- [ ] Monitoring page accessible
- [ ] CPU usage normal
- [ ] Memory usage normal
- [ ] Disk space sufficient
- [ ] No recent errors

### Application Logs
- [ ] Backend logs accessible: `npm logs`
- [ ] ML logs accessible: `python logs`
- [ ] Frontend errors tracked (console)
- [ ] Database connection logs checked
- [ ] No warnings in startup

---

## DNS & Domain (Optional)

- [ ] Custom domain purchased (if using)
- [ ] DNS records updated
- [ ] SSL certificate active
- [ ] HTTPS works with custom domain
- [ ] Redirects configured (www/non-www)

---

## Documentation

- [ ] README.md updated with Render links
- [ ] DEPLOYMENT_GUIDE.md accurate
- [ ] API documentation accessible
- [ ] Environment variables documented
- [ ] Known issues listed
- [ ] Contact/support info provided

---

## Communication & Handoff

- [ ] Stakeholders notified of launch
- [ ] User documentation prepared
- [ ] Feedback channel established
- [ ] Support contact info provided
- [ ] Monitoring access granted (if team)
- [ ] On-call schedule established

---

## Post-Deployment (First 24 Hours)

- [ ] Monitor error logs continuously
- [ ] Check user feedback regularly
- [ ] Verify database backups running
- [ ] Test authentication under load
- [ ] Verify analytics tracking
- [ ] Monitor performance metrics
- [ ] Be ready to rollback if critical issues

---

## Post-Deployment (First Week)

- [ ] Review crash reports
- [ ] Analyze user metrics
- [ ] Check database size
- [ ] Monitor ML service accuracy
- [ ] Gather user feedback
- [ ] Plan hotfixes if needed
- [ ] Document lessons learned
- [ ] Update security patches if available

---

## Sign-Off

- [ ] Project Manager: _________________ Date: _______
- [ ] Lead Developer: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] DevOps/Deployment: _________________ Date: _______

---

**Deployment Date:** _______________

**Deployment Time:** _______________

**Notes:**
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

---

## Rollback Plan

If critical issues occur post-deployment:

1. **Immediate (0-5 min):**
   - Revert frontend to previous build
   - Redeploy previous backend version
   - Check database integrity

2. **Short-term (5-30 min):**
   - Analyze error logs
   - Identify root cause
   - Communicate with users if outage

3. **Medium-term (30 min - 24 hours):**
   - Fix issues locally
   - Test thoroughly
   - Redeploy with fixes
   - Verify all systems

4. **Post-incident:**
   - Document what went wrong
   - Add pre-deployment tests for issue
   - Update deployment checklist

---

**Questions? Contact:** [Your Support Email]
