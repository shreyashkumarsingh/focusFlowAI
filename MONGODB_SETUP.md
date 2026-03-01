# MongoDB Atlas Setup Guide for FocusFlow

## Overview
MongoDB Atlas is a fully managed cloud database service that will host FocusFlow's data. This guide walks you through setting up a free cluster suitable for public deployment.

---

## Step 1: Create MongoDB Atlas Account

1. Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Enter your email and create a password
4. Accept terms and create account
5. Verify your email by clicking the link sent to your inbox

---

## Step 2: Create Organization & Project

### Create Organization
1. After email verification, you'll see the **Create Organization** page
2. Enter Organization Name: `FocusFlow` (or your app name)
3. Click **"Create Organization"**

### Create Project
1. You should be prompted to **Create a Project**
2. Project Name: `FocusFlow` (or descriptive name)
3. Click **"Create Project"**
4. Skip the **"Team"** section or add members if needed

---

## Step 3: Create Free Tier Cluster

### Cluster Configuration
1. Click **"Build a Cluster"** (or **"Create Cluster"**)
2. **Provider**: Select **AWS** (default is fine)
3. **Region**: Select a region close to your deployment region
   - For Render (US-West Oregon): Choose **US-EAST-1** or **US-WEST-1**
4. **Cluster Tier**: Select **M0 Sandbox** (free tier)
   - Storage: 512 MB
   - Latency: <1ms within region
   - Free for all clusters
5. **Cluster Name**: `focusflow-cluster` or similar
6. Click **"Create Cluster"**

### Wait for Cluster Creation
- Takes 1-3 minutes
- You'll see a progress bar
- Once ready, cluster will show in dashboard

---

## Step 4: Configure Network Access

### Allow All IP Addresses (for web apps)
1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Enter IP: `0.0.0.0/0`
5. Description: `Web App Access`
6. Click **"Confirm"**

⚠️ **Note**: For production, you can restrict to Render's IP range, but 0.0.0.0/0 is acceptable for web apps.

---

## Step 5: Create Database User

### Create Database User
1. In left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. **Authentication Method**: Select **"Password"**
4. **Username**: `focusflow_user`
5. **Password**: 
   - Click **"Autogenerate Secure Password"** (recommended)
   - Or create strong password: `MinimumLength(8)_WithNumbers123!_AndSymbols`
   - Copy and save this password securely
6. **Database User Privileges**: 
   - Select **"Built-in Roles"**
   - Role: **"Read and Write to Any Database"**
7. Click **"Add User"**

**Save these credentials in a secure location** (password manager, not in code)

---

## Step 6: Get Connection String

### Retrieve Connection String
1. Go to **"Clusters"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Drivers"** connection method
4. **Language**: Select **"Node.js"**
5. **Version**: Select latest (4.x or newer)
6. Copy the connection string

**Example connection string:**
```
mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Replace Placeholders
- Replace `<username>` with your MongoDB database user
- Replace `<password>` with your password (URL-encoded)
- Replace `<cluster-name>` with your actual cluster name
- Add database name: `/<database-name>?...`

---

## Step 7: Create Database (Optional)

### Create Database & Collections
1. In **"Clusters"**, click **"Browse Collections"**
2. Click **"+ Create Database"**
3. **Database Name**: `focusflow`
4. **Collection Name**: `users` (or let MongoDB create on first insert)
5. Click **"Create"**

Repeat for other collections if desired:
- `tasks`
- `statistics`
- `sessions`

Or let MongoDB auto-create these when your application first inserts data.

---

## Step 8: Store Secure Credentials

### Don't Commit to GitHub!
Create a `.env` file (never commit to git):

```bash
# Backend .env (server/.env.production)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
```

### Add to .gitignore
```bash
# In root .gitignore
.env
.env.local
.env.*.local
```

### For Render Deployment
1. Do NOT commit `MONGO_URI` to GitHub
2. In Render dashboard, set environment variable:
   - **Key**: `MONGO_URI`
   - **Value**: Paste your connection string
3. Render will inject this at runtime

---

## Step 9: Test Connection Locally

### Verify Connection Works

Create a test script (`server/test-db.js`):

```javascript
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI not set in environment');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
```

### Run Test
```bash
# Set environment variable
# On macOS/Linux:
export MONGO_URI="mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority"

# On Windows PowerShell:
$env:MONGO_URI="mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority"

# Run test
node test-db.js
```

**Expected Output:**
```
✅ MongoDB connected successfully
Database: focusflow
Host: focusflow-cluster.x1y2z3a4.mongodb.net
```

---

## Step 10: Enable Backups

### Enable Automated Backups
1. Go to **"Clusters"**
2. Click **"Backup"** tab
3. Toggle **"Backup"** to **ON**
4. Select backup frequency (default: Daily)
5. Backups are stored 7 days by default

---

## Step 11: Enable Monitoring (Optional)

### Monitor Database Performance
1. Click **"Monitoring"** in left sidebar
2. View:
   - Network I/O
   - CPU usage
   - Memory usage
   - Query execution time
3. Set up alerts for thresholds (if desired)

---

## Useful MongoDB Atlas Links

| Task | Link |
|------|------|
| Dashboard | https://cloud.mongodb.com |
| Documentation | https://docs.atlas.mongodb.com |
| Query Examples | https://docs.mongodb.com/manual/crud/ |
| Pricing | https://www.mongodb.com/cloud/atlas/pricing |
| Support | https://support.mongodb.com |

---

## Connection String Components Explained

```
mongodb+srv://focusflow_user:PASSWORD@focusflow-cluster.x1y2z3a4.mongodb.net/focusflow?retryWrites=true&w=majority
```

| Component | Meaning |
|-----------|---------|
| `mongodb+srv://` | Connection protocol (SRV = DNS service record) |
| `focusflow_user` | Database username |
| `PASSWORD` | Database password |
| `focusflow-cluster.x1y2z3a4.mongodb.net` | Cluster hostname |
| `focusflow` | Database name |
| `?retryWrites=true` | Automatically retry failed writes |
| `w=majority` | Write concern level (safe writes) |

---

## Troubleshooting

### Connection Refused
- ✅ Check network access: Settings → Network Access → 0.0.0.0/0 allowed
- ✅ Verify username and password are correct
- ✅ Confirm connection string has correct cluster name

### Authentication Failed
- ✅ Check for special characters in password that need URL encoding
- ✅ Recreate database user with simpler password (alphanumeric + dash)
- ✅ URL-encode special chars: `!` → `%21`, `@` → `%40`, etc.

### Cluster Still Creating
- ✅ Wait 1-3 minutes
- ✅ Refresh browser
- ✅ Check email for cluster creation status

### Database Size Limit (512 MB)
- ✅ M0 free tier limited to 512 MB
- ✅ Upgrade to M2 (paid) for production with more data
- ✅ Clean up old/test data if approaching limit

---

## Security Best Practices

1. **Never commit credentials** to GitHub
2. **Use URL encoding** for special characters in passwords
3. **Limit network access** to specific IP ranges in production
4. **Rotate passwords** periodically
5. **Enable two-factor authentication** on MongoDB Atlas account
6. **Monitor access logs** in Atlas dashboard
7. **Use separate credentials** for dev/staging/production

---

## Next Steps

After MongoDB Atlas setup:

1. ✅ Database ready
2. → Deploy backend to Render
3. → Deploy ML service to Render
4. → Deploy frontend to Render
5. → Test public login & registration
6. → Monitor performance

See `DEPLOYMENT_GUIDE.md` for Render deployment steps.

---

## Support

- MongoDB Atlas Support: https://support.mongodb.com
- Documentation: https://docs.atlas.mongodb.com
- Community: https://www.mongodb.com/community/forums/
