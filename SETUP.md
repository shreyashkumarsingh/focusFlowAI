# 🛠️ FocusFlowAI Setup Guide

Step-by-step guide to set up FocusFlowAI for local development.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version`

- **npm** (comes with Node.js)
  - Verify: `npm --version`

- **Python** (v3.9 or higher)
  - Download: https://python.org/
  - Verify: `python --version` or `python3 --version`

- **pip** (comes with Python)
  - Verify: `pip --version` or `pip3 --version`

- **MongoDB** (v7.0 or higher)
  - Option 1: [Install locally](https://www.mongodb.com/try/download/community)
  - Option 2: [Use MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database)
  - Verify: `mongod --version`

- **Git**
  - Download: https://git-scm.com/
  - Verify: `git --version`

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/focusflowai.git

# Navigate to the project directory
cd focusflowai
```

## Step 2: Set Up MongoDB

### Option A: Local MongoDB

1. **Start MongoDB** (if installed locally)
   ```bash
   # Windows
   mongod

   # macOS/Linux
   sudo systemctl start mongod
   # or
   brew services start mongodb-community
   ```

2. **Create Database** (optional - will be created automatically)
   ```bash
   mongosh
   use focusflowai
   ```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (M0 free tier)
4. Create a database user:
   - Username: `focusflowai_user`
   - Password: (generate a strong password)
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Click "Connect" → "Connect your application"
7. Copy the connection string (you'll need this later)

## Step 3: Set Up the Backend (Server)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `server/.env` with your configuration:

```env
# If using local MongoDB:
MONGO_URI=mongodb://localhost:27017/focusflowai

# If using MongoDB Atlas:
MONGO_URI=mongodb+srv://focusflowai_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/focusflowai?retryWrites=true&w=majority

# Generate a secure random string for JWT (minimum 32 characters)
JWT_SECRET=my_super_secret_jwt_key_change_this_in_production_abcdef123456

# Server port
PORT=5000

# Environment
NODE_ENV=development

# ML Service URL (we'll set this up next)
ML_SERVICE_URL=http://localhost:5001

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**Test the backend:**
```bash
# Start the development server
npm run dev

# You should see:
# 🚀 FocusFlowAI Server running on port 5000
# 📊 Environment: development
# Connected to MongoDB!
```

Keep this terminal open and running.

## Step 4: Set Up the ML Service

Open a **new terminal window/tab** and run:

```bash
# Navigate to ml-service directory (from project root)
cd ml-service

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file (optional)
cp .env.example .env
```

**Start the ML service:**
```bash
python app.py

# You should see:
# * Running on http://0.0.0.0:5001
```

Keep this terminal open and running.

## Step 5: Set Up the Frontend (Client)

Open a **new terminal window/tab** and run:

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ML_SERVICE_URL=http://localhost:5001
```

**Start the frontend:**
```bash
npm run dev

# You should see:
# VITE v7.x.x ready in xxx ms
# ➜ Local: http://localhost:5173/
```

## Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the FocusFlowAI home page!

## Step 7: Create Your First Account

1. Click "Get Started Free" or "Sign Up"
2. Fill in your details:
   - Name: Your Name
   - Email: your.email@example.com
   - Password: (minimum 6 characters)
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the dashboard

## Step 8: Test the Features

### Create a Task
1. In the dashboard, click "Add New Task"
2. Fill in:
   - Title: "Complete FocusFlowAI setup"
   - Category: Learning
   - Priority: High
   - Estimated time: 30 minutes
3. Click "Add Task"

### Start a Focus Session
1. Click the target icon (🎯) next to your task
2. The Pomodoro timer will appear
3. Click "Start" to begin your focus session
4. Click "Finish Task" when done

### View Analytics
1. Click "Analytics" in the navigation bar
2. View your productivity statistics
3. See AI-powered insights and burnout analysis

### Update Profile
1. Click "Profile" in the navigation bar
2. Edit your name and bio
3. Adjust preferences (theme, timer length, etc.)
4. Click "Save Changes"

## Troubleshooting

### Backend won't start

**Error: "MONGO_URI not defined"**
- Make sure you created the `.env` file in the `server` directory
- Check that MONGO_URI is properly set

**Error: "MongooseServerSelectionError"**
- If using local MongoDB: Make sure MongoDB is running
- If using MongoDB Atlas: Check your connection string and IP whitelist

**Error: "Port 5000 already in use"**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### ML Service won't start

**Error: "No module named 'flask'"**
```bash
# Make sure virtual environment is activated
pip install -r requirements.txt
```

**Error: "Port 5001 already in use"**
```bash
# Kill the process using port 5001
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5001 | xargs kill -9
```

### Frontend won't start

**Error: "Cannot find module"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**Error: CORS errors in browser console**
- Check that backend is running on port 5000
- Verify VITE_API_URL in `client/.env` is correct

### Features not working

**"ML service unavailable" errors**
- Make sure ML service is running on port 5001
- Check console logs for errors

**Authentication issues**
- Clear browser localStorage: `localStorage.clear()`
- Delete cookies
- Re-login

**Tasks not saving**
- Check MongoDB connection
- Look at backend console for error messages

## Development Tips

### Hot Reload

All three services support hot reload:
- **Backend**: `nodemon` watches for file changes
- **Frontend**: Vite HMR updates instantly
- **ML Service**: Flask debug mode reloads on changes

### Database GUI

Use MongoDB Compass to view your database:
1. Download: https://www.mongodb.com/try/download/compass
2. Connect using your MONGO_URI
3. Browse collections (users, tasks)

### API Testing

Use tools like:
- Postman: https://www.postman.com/
- Insomnia: https://insomnia.rest/
- Thunder Client (VS Code extension)

Example API call:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- Python
- MongoDB for VS Code
- REST Client
- GitLens

### Project Structure

```
FocusFlowAI/
├── client/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context
│   │   ├── api/         # Axios config
│   │   └── types.ts     # TypeScript types
│   └── package.json
├── server/          # Node.js + Express backend
│   ├── controllers/ # Route handlers
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API routes
│   ├── middleware/  # Auth middleware
│   └── package.json
└── ml-service/      # Python + Flask ML service
    ├── app.py       # Main application
    └── requirements.txt
```

## Next Steps

1. ✅ Set up local development environment
2. 🚀 Explore the application features
3. 📖 Read the [API Documentation](README.md#-api-documentation)
4. 🐳 Try [Docker deployment](DEPLOYMENT.md#docker-deployment)
5. ☁️ Deploy to the cloud following [DEPLOYMENT.md](DEPLOYMENT.md)
6. 🤝 Contribute! See [CONTRIBUTING.md](CONTRIBUTING.md)

## Need Help?

- 📚 Read the [full README](README.md)
- 🐛 Check [existing issues](https://github.com/yourusername/focusflowai/issues)
- 💬 Open a [new issue](https://github.com/yourusername/focusflowai/issues/new)
- 📧 Contact: your.email@example.com

---

Happy coding! 🚀
