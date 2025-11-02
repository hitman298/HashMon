# Vercel Deployment Guide for HashMon

This guide will help you deploy both the frontend and backend of HashMon to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. GitHub repository connected to Vercel
3. All environment variables ready

## Deployment Options

You have two options for deployment:

### Option 1: Separate Projects (Recommended)
Deploy frontend and backend as separate Vercel projects for better isolation and scaling.

### Option 2: Monorepo Deployment
Deploy everything from the root directory.

---

## Option 1: Separate Projects (Recommended)

### Step 1: Deploy Backend

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository

2. **Configure Backend Project**
   - **Project Name**: `hashmon-backend` (or your preferred name)
   - **Root Directory**: Select `backend`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   Add all your backend environment variables:
   ```
   PORT=3000
   NODE_ENV=production
   PHAROS_RPC_URL=https://testnet.dplabs-internal.com
   BACKEND_PRIVATE_KEY=your_backend_wallet_private_key
   HASHMON_CONTRACT_ADDRESS=your_contract_address
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   VOUCHER_EXPIRY_HOURS=24
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the deployment URL (e.g., `https://hashmon-backend.vercel.app`)

### Step 2: Deploy Frontend

1. **Create New Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import the same GitHub repository

2. **Configure Frontend Project**
   - **Project Name**: `hashmon-frontend` (or your preferred name)
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: Vite (should auto-detect)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   VITE_HASHMON_CONTRACT_ADDRESS=your_contract_address
   VITE_PHAROS_RPC_URL=https://testnet.dplabs-internal.com
   VITE_PHAROS_CHAIN_ID=688688
   VITE_PHAROS_EXPLORER_URL=https://testnet.pharosscan.xyz
   ```

4. **Deploy**
   - Click "Deploy"
   - Your frontend will be live!

---

## Option 2: Monorepo Deployment

### Single Project Setup

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository

2. **Configure Project**
   - **Root Directory**: `.` (root)
   - **Framework Preset**: Other
   - Use the `vercel.json` configuration file

3. **Set Environment Variables**
   Add all environment variables from both frontend and backend:
   ```
   # Backend variables
   PORT=3000
   NODE_ENV=production
   PHAROS_RPC_URL=...
   BACKEND_PRIVATE_KEY=...
   # ... (all backend vars)
   
   # Frontend variables
   VITE_API_URL=https://your-project.vercel.app/api
   VITE_HASHMON_CONTRACT_ADDRESS=...
   # ... (all frontend vars)
   ```

4. **Deploy**
   - Click "Deploy"
   - Frontend will be served from root
   - Backend API will be at `/api/*`

---

## Environment Variables Reference

### Backend Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (Vercel auto-assigns) | No |
| `NODE_ENV` | Environment (production) | Yes |
| `PHAROS_RPC_URL` | Pharos network RPC URL | Yes |
| `BACKEND_PRIVATE_KEY` | Backend wallet private key | Yes |
| `HASHMON_CONTRACT_ADDRESS` | Deployed contract address | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `VOUCHER_EXPIRY_HOURS` | Voucher expiration time | No |
| `FRONTEND_URL` | Frontend deployment URL | Yes |
| `API_RATE_LIMIT` | Rate limit per window | No |

### Frontend Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_HASHMON_CONTRACT_ADDRESS` | Contract address | Yes |
| `VITE_PHAROS_RPC_URL` | Pharos RPC URL | Yes |
| `VITE_PHAROS_CHAIN_ID` | Chain ID (688688) | Yes |
| `VITE_PHAROS_EXPLORER_URL` | Block explorer URL | Yes |

---

## Post-Deployment Steps

### 1. Update CORS Settings

After deployment, update your backend's `FRONTEND_URL` environment variable to include your frontend URL:

```
FRONTEND_URL=https://your-frontend.vercel.app
```

### 2. Test Your Deployment

1. **Test Backend Health**
   ```
   curl https://your-backend.vercel.app/health
   ```

2. **Test API Endpoint**
   ```
   curl https://your-backend.vercel.app/api/player/health
   ```

3. **Test Frontend**
   - Visit your frontend URL
   - Connect wallet
   - Test basic functionality

### 3. Configure Custom Domains (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` and `VITE_API_URL` accordingly

---

## Troubleshooting

### Backend Issues

**Problem**: API routes return 404
- **Solution**: Ensure `vercel.json` routes are configured correctly
- Check that `backend/server.js` exports the Express app

**Problem**: CORS errors
- **Solution**: Add frontend URL to `FRONTEND_URL` environment variable
- Check CORS configuration in `backend/server.js`

**Problem**: Environment variables not loading
- **Solution**: Ensure variables are set in Vercel dashboard
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### Frontend Issues

**Problem**: Build fails
- **Solution**: Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript/build errors

**Problem**: API calls fail
- **Solution**: Verify `VITE_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is deployed and accessible

**Problem**: White screen / app doesn't load
- **Solution**: Check browser console for errors
- Verify environment variables are set
- Check Vite build output

---

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. To configure:

1. Go to Project Settings → Git
2. Connect your repository
3. Set production branch (usually `main`)
4. Deployments will trigger automatically

---

## Monitoring

- **Deployment Logs**: View in Vercel dashboard
- **Function Logs**: Check Vercel dashboard → Functions tab
- **Analytics**: Available in Vercel dashboard (Pro plan)

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review environment variables
3. Test endpoints with curl/Postman
4. Check GitHub Issues for known problems

