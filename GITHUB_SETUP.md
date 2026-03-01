# GitHub Repository Setup for FocusFlow Deployment

This guide ensures your GitHub repository is properly configured for Render deployment and production use.

---

## Step 1: Create GitHub Repository

### Initialize Repository

If not already created:

```bash
# On your machine, in FocusFlow directory
git init
git add .
git commit -m "Initial commit: FocusFlow full-stack application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/FocusFlow.git
git push -u origin main
```

### Verify on GitHub

1. Visit https://github.com/YOUR_USERNAME/FocusFlow
2. Should see all files and folders:
   - `server/`
   - `client/`
   - `ml-service/`
   - `README.md`
   - etc.

---

## Step 2: Create Proper .gitignore

### Root .gitignore

Create `.gitignore` in project root:

```
# Environment Variables
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production
.env.production.local

# Dependencies
node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
ENV/
build/
pip-log.txt
pip-delete-this-directory.txt

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
*.sublime-project
*.sublime-workspace

# Build Artifacts
dist/
build/
*.egg-info/
.pytest_cache/
.tox/
.coverage
htmlcov/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS Files
.DS_Store
Thumbs.db

# IDE Generated
.vscode/settings.json
.vscode/launch.json
.vscode/extensions.json

# Temporary Files
*.tmp
*.bak
.~*

# Cache
.cache/
*.cache
.eslintcache
```

### Commit .gitignore

```bash
git add .gitignore
git commit -m "Add .gitignore for security"
git push origin main
```

---

## Step 3: Verify Critical Files Are NOT Committed

### Check for Secrets in Git History

```bash
# Search for common secret patterns
git log --all -S "mongodb+srv://" -- .
git log --all -S "JWT_SECRET=" -- .
git log --all -S "password" -- .
```

If found, these need to be removed from history:
```bash
# Remove sensitive file from history
git filter-branch --tree-filter 'rm -f .env' HEAD
git push origin main --force
```

⚠️ **Better**: Just make sure .env is in .gitignore BEFORE committing!

---

## Step 4: Create Environment Template Files

### .env.example (NO SECRETS!)

Create `server/.env.example`:

```env
# Example Backend Environment Variables
# Copy this to .env and fill in real values

NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/<database>
JWT_SECRET=your-secret-key-here-minimum-32-characters
ML_SERVICE_URL=http://localhost:5001
CLIENT_URL=http://localhost:5173
```

Create `client/.env.example`:

```env
# Example Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
VITE_ML_SERVICE_URL=http://localhost:5001
```

Create `ml-service/.env.example`:

```env
# Example ML Service Environment Variables
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5001
CORS_ORIGINS=http://localhost:5173,http://localhost:5000
```

### Commit Example Files

```bash
git add server/.env.example client/.env.example ml-service/.env.example
git commit -m "Add environment variable templates"
git push origin main
```

---

## Step 5: Ensure render.yaml Files Are Correct

### Backend render.yaml

**File**: `server/render.yaml`

```yaml
services:
  - type: web
    name: focusflow-api
    runtime: node
    plan: free
    branch: main
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: ML_SERVICE_URL
        sync: false
      - key: CLIENT_URL
        sync: false
```

### ML Service render.yaml

**File**: `ml-service/render.yaml`

```yaml
services:
  - type: web
    name: focusflow-ml
    runtime: python-3
    plan: free
    branch: main
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn --bind 0.0.0.0:5001 --workers 2 --timeout 60 app:app
    envVars:
      - key: FLASK_ENV
        value: production
      - key: FLASK_DEBUG
        value: "0"
      - key: PORT
        value: 5001
```

### Frontend render.yaml

**File**: `client/render.yaml`

```yaml
services:
  - type: static_site
    name: focusflow-web
    plan: free
    branch: main
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        value: https://focusflow-api.onrender.com/api
      - key: VITE_ML_SERVICE_URL
        value: https://focusflow-ml.onrender.com
```

### Commit render.yaml Files

```bash
git add server/render.yaml client/render.yaml ml-service/render.yaml
git commit -m "Add Render deployment configuration"
git push origin main
```

---

## Step 6: Verify package.json Files

### Backend package.json

**File**: `server/package.json`

Ensure it has:
```json
{
  "name": "focusflow-api",
  "version": "1.0.0",
  "description": "FocusFlow Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  }
}
```

### Frontend package.json

**File**: `client/package.json`

Ensure it has:
```json
{
  "name": "focusflow-web",
  "version": "1.0.0",
  "description": "FocusFlow Frontend",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "axios": "^1.0.0"
  }
}
```

### ML Service requirements.txt

**File**: `ml-service/requirements.txt`

Ensure it has:
```
Flask==3.0.0
flask-cors==4.0.0
numpy==1.24.0
pandas==1.5.0
scikit-learn==1.2.0
gunicorn==21.2.0
python-dotenv==1.0.0
```

---

## Step 7: Documentation Files

### README.md

Root `README.md` should include:

```markdown
# FocusFlow

A full-stack productivity application with AI-powered analytics and focus management.

## Features

- User authentication (login/signup)
- Task management and tracking
- Focus timer
- Advanced analytics with AI insights
- Dark mode support
- Responsive design

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + MongoDB
- **ML**: Python + Flask + scikit-learn
- **Deployment**: Render.com

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB local or Atlas

### Setup

1. Clone repository
2. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   cd ../ml-service && pip install -r requirements.txt
   ```

3. Create `.env` files from examples
4. Run services:
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev

   # Terminal 2: Frontend
   cd client && npm run dev

   # Terminal 3: ML Service
   cd ml-service && python app.py
   ```

## Deployment

See [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md) for public deployment on Render.

## License

MIT License - see LICENSE file
```

### SETUP.md

Document local development setup:

```markdown
# Local Development Setup

## Prerequisites
- Node.js 18+ (download from nodejs.org)
- Python 3.8+ (download from python.org)
- MongoDB (local install or MongoDB Atlas)
- Git

## Installation

1. Clone repository
2. Run setup script:
   ```bash
   npm install --prefix server
   npm install --prefix client
   pip install -r ml-service/requirements.txt
   ```

3. Create environment files:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   cp ml-service/.env.example ml-service/.env
   ```

4. Update `.env` files with local values

## Run Development Servers

Terminal 1 - Backend:
```bash
cd server && npm run dev
# Runs on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd client && npm run dev
# Runs on http://localhost:5173
```

Terminal 3 - ML Service:
```bash
cd ml-service && python app.py
# Runs on http://localhost:5001
```

## Test

- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api/health
- ML: http://localhost:5001/health
```

---

## Step 8: Branch Protection (Optional but Recommended)

### Enable Branch Protection

1. Go to GitHub repo
2. Settings → Branches
3. Under "Branch protection rules" → "Add rule"
4. Pattern name: `main`
5. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass
   - ✅ Dismiss stale pull request approvals
6. Save

This prevents accidental breaks to the production branch.

---

## Step 9: GitHub Secrets (Optional - Advanced)

If using GitHub Actions for CI/CD:

1. Settings → Secrets and variables → Actions
2. New repository secret:
   - Name: `RENDER_API_KEY`
   - Value: (from Render dashboard)
3. Can use in GitHub Actions workflow

---

## Step 10: Final Verification

### Check Repository Status

```bash
# List all tracked files
git ls-tree -r HEAD --name-only

# Verify no secrets committed
git log --all --source --source-full -S "mongodb+srv" --
git log --all --source --source-full -S "JWT_SECRET" --

# Show current status
git status
```

### Verify All Files Needed for Deployment

- [ ] `server/server.js` - Main backend file
- [ ] `server/package.json` - Backend dependencies
- [ ] `server/render.yaml` - Backend deployment config
- [ ] `client/src/` - Frontend source
- [ ] `client/package.json` - Frontend dependencies
- [ ] `client/render.yaml` - Frontend deployment config
- [ ] `ml-service/app.py` - Main ML file
- [ ] `ml-service/requirements.txt` - Python dependencies
- [ ] `ml-service/render.yaml` - ML deployment config
- [ ] `.gitignore` - Excludes secrets
- [ ] `.env.example` files - Templates
- [ ] `README.md` - Project info
- [ ] `DEPLOYMENT_QUICKSTART.md` - Deployment guide
- [ ] All source code in place

---

## Step 11: Deploy

Once verified:

```bash
# Make sure everything is committed
git add .
git commit -m "Finalize for production deployment"
git push origin main

# Now proceed with Render deployment
# See DEPLOYMENT_QUICKSTART.md
```

---

## Common Repository Mistakes

### ❌ DON'T:
- Commit `.env` files
- Commit `node_modules/` or `__pycache__/`
- Commit build artifacts (`dist/`, `build/`)
- Commit secrets or API keys
- Commit IDE-specific files

### ✅ DO:
- Add `.gitignore` for all the above
- Use `.env.example` for templates
- Store secrets in Render environment
- Keep main branch clean and deployable
- Use descriptive commit messages
- Write good README and documentation

---

## Summary

Your repository is now:
- ✅ Properly configured with `.gitignore`
- ✅ Free of secrets and sensitive data
- ✅ Ready for Render deployment
- ✅ Well-documented for users
- ✅ Has deployment configuration files
- ✅ Follows best practices

**Next**: Follow the [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md) to deploy to Render! 🚀
