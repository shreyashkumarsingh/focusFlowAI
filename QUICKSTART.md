# FocusFlowAI Quick Start 🚀

## One-Command Setup (Docker)

```bash
docker-compose up -d
```

Then visit: http://localhost:3000

## Manual Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### 2. ML Service
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

### 3. Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Server (.env)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `PORT` - Server port (default: 5000)

### Client (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_ML_SERVICE_URL` - ML service URL

## First Steps

1. Open http://localhost:5173
2. Sign up for an account
3. Create your first task
4. Start a focus session!

For detailed setup: See [SETUP.md](SETUP.md)  
For deployment: See [DEPLOYMENT.md](DEPLOYMENT.md)
