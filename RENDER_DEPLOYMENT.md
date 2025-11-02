# Render Deployment Guide for HashMon

This guide will help you deploy both the frontend and backend of HashMon to Render.

## Why Render?

- **Full-stack hosting**: Great for both frontend and backend
- **Built-in databases**: Easy PostgreSQL/Supabase integration
- **Environment variables**: Simple configuration
- **Free tier available**: Good for testing and small projects
- **Docker support**: Flexible deployment options

---

## Prerequisites

1. A [Render account](https://render.com) (free account works)
2. GitHub repository connected
3. All environment variables ready

---

## Part 1: Deploy Backend

### Step 1: Create Web Service

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub account if not already connected
   - Select repository: `hitman298/HashMon`
   - Click "Connect"

3. **Configure Backend Service**
   - **Name**: `hashmon-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ **IMPORTANT**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   
   Click "Advanced" → "Add Environment Variable" and add:
   
   ```bash
   NODE_ENV=production
   PORT=10000
   
   # Blockchain Configuration
   PHAROS_RPC_URL=https://testnet.dplabs-internal.com
   BACKEND_PRIVATE_KEY=your_backend_wallet_private_key
   HASHMON_CONTRACT_ADDRESS=your_contract_address
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Security
   JWT_SECRET=your_jwt_secret_key_here
   VOUCHER_EXPIRY_HOURS=24
   
   # Frontend URL (will update after frontend deploys)
   FRONTEND_URL=https://your-frontend.onrender.com
   
   # Optional
   API_RATE_LIMIT=100
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment (takes 5-10 minutes)
   - Copy the service URL (e.g., `https://hashmon-backend.onrender.com`)

### Step 2: Verify Backend

Test your backend:
```bash
curl https://your-backend.onrender.com/health
```

Should return:
```json
{"status":"healthy","timestamp":"...","version":"1.0.0","network":"pharos"}
```

---

## Part 2: Deploy Frontend

### Step 1: Create Static Site

1. **Go to Render Dashboard**
   - Click "New +" → "Static Site"

2. **Connect Repository**
   - Select repository: `hitman298/HashMon`
   - Click "Connect"

3. **Configure Frontend**
   - **Name**: `hashmon-frontend` (or your preferred name)
   - **Branch**: `main`
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Set Environment Variables**
   
   Click "Environment" tab and add:
   
   ```bash
   # API Configuration (use your backend Render URL)
   VITE_API_URL=https://your-backend.onrender.com/api
   
   # Blockchain Configuration
   VITE_HASHMON_CONTRACT_ADDRESS=your_contract_address
   
   # Network Configuration
   VITE_PHAROS_RPC_URL=https://testnet.dplabs-internal.com
   VITE_PHAROS_CHAIN_ID=688688
   VITE_PHAROS_EXPLORER_URL=https://testnet.pharosscan.xyz
   
   # Privy Wallet (Optional)
   VITE_PRIVY_APP_ID=cmgn86sbf004wi90dqvbqfrs8
   ```

5. **Deploy**
   - Click "Create Static Site"
   - Wait for build and deployment
   - Copy the site URL (e.g., `https://hashmon-frontend.onrender.com`)

### Step 2: Update Backend CORS

After frontend deploys:

1. Go to backend service → "Environment"
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-frontend.onrender.com
   ```
3. Click "Save Changes"
4. Render will auto-redeploy

---

## Part 3: Alternative - Backend as Web Service with Docker

If you prefer Docker deployment:

### Create Dockerfile for Backend

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 10000

# Start application
CMD ["npm", "start"]
```

### Create .dockerignore

Create `backend/.dockerignore`:
```
node_modules
.env
.env.local
*.log
.git
.gitignore
```

Then in Render:
- Select "Docker" as runtime
- Root Directory: `backend`
- Dockerfile Path: `backend/Dockerfile` (or leave empty if in root)

---

## Environment Variables Reference

### Backend Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production) | Yes |
| `PORT` | Server port (Render assigns, but set to 10000) | Yes |
| `PHAROS_RPC_URL` | Pharos network RPC URL | Yes |
| `BACKEND_PRIVATE_KEY` | Backend wallet private key | Yes |
| `HASHMON_CONTRACT_ADDRESS` | Deployed contract address | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `FRONTEND_URL` | Frontend deployment URL | Yes |
| `VOUCHER_EXPIRY_HOURS` | Voucher expiration time | No |
| `API_RATE_LIMIT` | Rate limit per window | No |

### Frontend Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_HASHMON_CONTRACT_ADDRESS` | Contract address | Yes |
| `VITE_PHAROS_RPC_URL` | Pharos RPC URL | Yes |
| `VITE_PHAROS_CHAIN_ID` | Chain ID (688688) | Yes |
| `VITE_PHAROS_EXPLORER_URL` | Block explorer URL | Yes |
| `VITE_PRIVY_APP_ID` | Privy App ID (optional) | No |

---

## Render Features

### Auto-Deploy

- **Automatic**: Deploys on every push to `main` branch
- **Manual**: Can trigger manual deployments
- **Rollback**: Easy rollback to previous deployments

### Health Checks

Render automatically checks:
- Backend: HTTP health endpoint (`/health`)
- Frontend: Static file serving

### Logs

- **View Logs**: Click on service → "Logs" tab
- **Streaming**: Real-time log streaming
- **Search**: Search through logs

### Custom Domains

1. Go to service → "Settings" → "Custom Domains"
2. Add your domain
3. Update DNS records as instructed
4. Update environment variables with new domain

---

## Troubleshooting

### Backend Issues

**Problem**: Service won't start
- **Check**: Start command is `npm start`
- **Check**: `package.json` has start script
- **Check**: Port is set correctly (10000)
- **Solution**: Check logs for specific errors

**Problem**: Environment variables not loading
- **Check**: Variable names match exactly
- **Check**: No extra spaces in values
- **Solution**: Redeploy after adding variables

**Problem**: Timeout errors
- **Check**: Health check endpoint works
- **Solution**: Increase timeout in service settings

### Frontend Issues

**Problem**: Build fails
- **Check**: Root Directory is `frontend`
- **Check**: Build command is correct
- **Check**: All dependencies in `package.json`
- **Solution**: Check build logs for errors

**Problem**: Environment variables not working
- **Check**: Variables start with `VITE_`
- **Check**: Variables are set in Render dashboard
- **Solution**: Redeploy after adding variables

**Problem**: API calls fail
- **Check**: `VITE_API_URL` is correct backend URL
- **Check**: Backend is running
- **Check**: CORS is configured
- **Solution**: Test backend URL directly

### Common Issues

**Problem**: "Service unavailable" after deployment
- **Solution**: Check logs, verify start command
- **Solution**: Ensure health check endpoint exists

**Problem**: Slow cold starts
- **Solution**: Upgrade to paid plan (faster instances)
- **Solution**: Use "always on" option (paid)

**Problem**: Build timeout
- **Solution**: Optimize build process
- **Solution**: Use Docker for more control

---

## Render vs Vercel

| Feature | Render | Vercel |
|---------|--------|--------|
| **Backend** | ✅ Excellent | ⚠️ Serverless only |
| **Frontend** | ✅ Good | ✅ Excellent |
| **Database** | ✅ Built-in | ❌ External only |
| **Free Tier** | ✅ Yes (with limits) | ✅ Yes |
| **Docker** | ✅ Supported | ⚠️ Limited |
| **Logs** | ✅ Good | ✅ Excellent |
| **CDN** | ✅ Fast | ✅ Very Fast |

**Choose Render if**:
- You need traditional backend hosting
- You want Docker support
- You need database hosting
- You prefer simple configuration

**Choose Vercel if**:
- You want serverless functions
- You need fastest frontend CDN
- You prefer modern deployment
- You want automatic optimizations

---

## Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Backend health check working (`/health`)
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] Backend CORS updated with frontend URL
- [ ] Wallet connect working
- [ ] API calls successful
- [ ] Test basic functionality

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Pricing](https://render.com/pricing)
- [Render Support](https://render.com/docs/support)

---

## Quick Commands

### Test Backend
```bash
curl https://your-backend.onrender.com/health
curl https://your-backend.onrender.com/api
```

### Test Frontend
```bash
curl https://your-frontend.onrender.com
```

### View Logs
- Go to Render Dashboard → Service → Logs tab

---

**Ready to deploy? Follow the steps above and your HashMon app will be live on Render!** 🚀

