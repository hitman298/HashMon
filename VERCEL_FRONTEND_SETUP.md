# Vercel Frontend Deployment Checklist

## ✅ Quick Setup Steps

### 1. Create Frontend Project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `hitman298/HashMon`
3. Configure project:
   - **Project Name**: `hashmon-frontend` (or your preferred name)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT**
   - **Framework Preset**: Vite (should auto-detect)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2. Set Environment Variables

Go to **Project Settings → Environment Variables** and add:

```bash
# API Configuration
VITE_API_URL=https://your-backend-url.vercel.app/api

# Blockchain Configuration  
VITE_HASHMON_CONTRACT_ADDRESS=0xae693A1003de169116740e0B071E65CbCf1a3FC9

# Network Configuration
VITE_PHAROS_RPC_URL=https://testnet.dplabs-internal.com
VITE_PHAROS_CHAIN_ID=688688
VITE_PHAROS_EXPLORER_URL=https://testnet.pharosscan.xyz

# Privy Wallet (Optional - uses default if not set)
VITE_PRIVY_APP_ID=cmgn86sbf004wi90dqvbqfrs8
```

**Important**: 
- All frontend variables MUST start with `VITE_`
- Replace `your-backend-url.vercel.app` with your actual backend URL
- Redeploy after adding variables

### 3. Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Check deployment logs for any errors
4. Visit your deployment URL

### 4. Update Backend CORS

After frontend deploys, update backend environment variable:
- Go to backend project in Vercel
- Add/Update: `FRONTEND_URL=https://your-frontend.vercel.app`
- Redeploy backend

## 🔍 Troubleshooting

### Build Fails

**Check**:
- Root Directory is set to `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- All dependencies in `package.json`

**Fix**:
- Check build logs in Vercel dashboard
- Ensure `frontend/package.json` exists
- Verify Node.js version (should be 18+)

### Environment Variables Not Working

**Check**:
- Variables start with `VITE_`
- Variables are set in correct environment (Production/Preview)
- Redeployed after adding variables

**Fix**:
- Check variable names (case-sensitive)
- Set variables in Vercel dashboard
- Redeploy after changes

### Wallet Connect Not Working

**Check**:
- `VITE_PRIVY_APP_ID` is set (or uses default)
- Browser console for errors
- Network tab for Privy API calls

**Fix**:
- See `WALLET_CONNECT_TROUBLESHOOTING.md`
- Check browser console for specific errors
- Verify Privy App ID in [Privy Dashboard](https://dashboard.privy.io/)

### API Calls Failing

**Check**:
- `VITE_API_URL` is correct
- Backend is deployed and accessible
- CORS is configured on backend

**Fix**:
- Test backend URL: `curl https://your-backend.vercel.app/health`
- Update `VITE_API_URL` if backend URL changed
- Check backend CORS settings

## 📋 Post-Deployment Checklist

- [ ] Frontend builds successfully
- [ ] Environment variables are set
- [ ] Frontend URL is accessible
- [ ] Wallet connect button works
- [ ] API calls are successful
- [ ] Backend CORS updated with frontend URL
- [ ] Test wallet connection
- [ ] Test basic functionality

## 🔄 Redeploying

### Automatic Deployment
- Push to `main` branch = auto-deploy to Production
- Push to other branches = Preview deployment

### Manual Redeploy
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Or trigger via GitHub push

### After Code Changes
1. Push changes to GitHub
2. Vercel auto-detects and builds
3. New deployment created automatically
4. Production URL updates automatically

## 🌐 Custom Domain

1. Go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `VITE_API_URL` if needed
5. Update backend `FRONTEND_URL`

## 📊 Monitoring

- **Deployments**: View all deployments and their status
- **Logs**: Check function logs for runtime errors
- **Analytics**: View traffic and performance (Pro plan)
- **Settings**: Configure build settings, environment variables

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

