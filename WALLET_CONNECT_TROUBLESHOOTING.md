# Wallet Connect Troubleshooting Guide

If wallet connection is not working, follow these steps:

## Common Issues

### 1. Privy App ID Not Configured

**Problem**: Privy needs a valid App ID to work.

**Solution**:
- Check that the Privy App ID is set in `frontend/src/main.jsx`
- Default App ID: `cmgn86sbf004wi90dqvbqfrs8`
- To use a different App ID, set `VITE_PRIVY_APP_ID` environment variable

### 2. Environment Variables Missing

**Problem**: Required environment variables not set.

**Solution**: Ensure these are set in your `.env` file or Vercel:
```
VITE_API_URL=https://your-backend.vercel.app/api
VITE_PHAROS_RPC_URL=https://testnet.dplabs-internal.com
VITE_PHAROS_CHAIN_ID=688688
VITE_PHAROS_EXPLORER_URL=https://testnet.pharosscan.xyz
VITE_PRIVY_APP_ID=your-privy-app-id (optional)
```

### 3. Browser Console Errors

**Check the browser console** (F12) for errors:
- Look for Privy-related errors
- Check for network errors
- Verify React is rendering correctly

### 4. Privy Provider Not Initializing

**Symptoms**:
- Button doesn't respond
- No login modal appears
- "Wallet Loading" stays forever

**Solution**:
1. Check browser console for Privy errors
2. Verify Privy App ID is correct
3. Check network tab for failed Privy API calls
4. Try clearing browser cache and reloading

### 5. Network Issues

**Problem**: Privy can't connect to their servers.

**Solution**:
- Check internet connection
- Disable ad blockers temporarily
- Check if Privy is blocked by firewall
- Try a different network

### 6. Wallet Extension Issues

**Problem**: MetaMask or other wallet extensions conflict.

**Solution**:
- Update wallet extension to latest version
- Try disabling other wallet extensions temporarily
- Use Privy's embedded wallet option instead

## Debugging Steps

### Step 1: Check Browser Console

Open browser console (F12) and look for:
- ✅ "Privy App ID: ..." - Should show your App ID
- ✅ "Step 2 complete: Full app rendered successfully" - React/Privy loaded
- ❌ Any red error messages

### Step 2: Test Privy Connection

1. Click "Connect Wallet" button
2. Check console for:
   - "Attempting Privy login..."
   - Login modal should appear
   - Any error messages

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "privy"
3. Check if requests to Privy API are successful
4. Look for 401/403 errors (invalid App ID)

### Step 4: Verify Privy App ID

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Verify your App ID matches
3. Check App settings for any restrictions

## Quick Fixes

### Fix 1: Clear Cache and Reload

```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Fix 2: Check Privy App ID

Update `frontend/src/main.jsx`:
```javascript
const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || 'your-actual-app-id';
```

### Fix 3: Update Environment Variables

Ensure all environment variables are set:
- In `.env` file for local development
- In Vercel dashboard for production

### Fix 4: Verify Privy Package Version

Check `frontend/package.json`:
```json
"@privy-io/react-auth": "^3.3.0"
```

Update if needed:
```bash
cd frontend
npm install @privy-io/react-auth@latest
```

## Testing Locally

1. **Start development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open browser** to `http://localhost:5000`

3. **Check console** for errors

4. **Click "Connect Wallet"** and verify:
   - Login modal appears
   - Can select login method
   - Wallet connects successfully

## Production Deployment

### Vercel Environment Variables

Make sure these are set in Vercel:
1. Go to Project Settings → Environment Variables
2. Add all `VITE_*` variables
3. Redeploy after adding variables

### Common Production Issues

1. **Environment variables not loaded**
   - Variables must start with `VITE_` to be available in frontend
   - Redeploy after adding new variables

2. **CORS errors**
   - Check backend CORS settings
   - Ensure `FRONTEND_URL` is set in backend

3. **Privy App ID mismatch**
   - Verify App ID is correct in production
   - Check Privy dashboard for production app settings

## Still Not Working?

1. **Check Privy Status**: Visit [status.privy.io](https://status.privy.io)
2. **Privy Documentation**: [docs.privy.io](https://docs.privy.io)
3. **GitHub Issues**: Check for known issues
4. **Contact Support**: Privy support or check logs

## Console Debugging

Add this to check Privy state:
```javascript
// In browser console after page loads:
window.privyDebug = () => {
  const privy = window.privy;
  console.log('Privy Debug:', {
    exists: !!privy,
    user: privy?.user,
    authenticated: privy?.authenticated,
  });
};
// Then run: privyDebug()
```

