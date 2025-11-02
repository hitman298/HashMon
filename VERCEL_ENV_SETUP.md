# Fix: Frontend Calling localhost Instead of Production Backend

## Problem
Your frontend is trying to call `http://localhost:3000/api` instead of your production backend URL. This happens when `VITE_API_URL` environment variable is not set in Vercel.

## Quick Fix (5 minutes)

### Step 1: Get Your Backend URL

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your **backend** project
3. Copy the deployment URL (e.g., `https://hashmon-backend.vercel.app`)

### Step 2: Set Frontend Environment Variable

1. Go to your **frontend** project in Vercel
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Set:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.vercel.app/api`
   - **Environment**: Select all (Production, Preview, Development)
   - **Important**: Make sure to add `/api` at the end!

### Step 3: Redeploy Frontend

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

### Step 4: Verify

After redeploy, open browser console and check for:
```
🔧 API Configuration: { VITE_API_URL: "https://your-backend.vercel.app/api", ... }
```

If you still see `localhost:3000`, the variable wasn't set correctly.

## Example Configuration

### If your backend is: `https://hashmon-backend.vercel.app`

**Frontend Environment Variable:**
```
VITE_API_URL=https://hashmon-backend.vercel.app/api
```

**Backend Environment Variable:**
```
FRONTEND_URL=https://hashmon-frontend.vercel.app
```

## Common Mistakes

❌ **Wrong**: `VITE_API_URL=https://hashmon-backend.vercel.app`
✅ **Correct**: `VITE_API_URL=https://hashmon-backend.vercel.app/api`

❌ **Wrong**: `VITE_API_URL=/api` (relative URL)
✅ **Correct**: `VITE_API_URL=https://hashmon-backend.vercel.app/api` (full URL)

❌ **Wrong**: Setting in wrong environment (only Production)
✅ **Correct**: Set for all environments (Production, Preview, Development)

## Verify It's Working

1. **Check Browser Console**
   - Look for: `🔧 API Configuration: { VITE_API_URL: "..." }`
   - Should show your production backend URL, NOT localhost

2. **Test API Call**
   - Open browser console
   - Run: `fetch(import.meta.env.VITE_API_URL + '/health').then(r => r.json()).then(console.log)`
   - Should return: `{status: "healthy", ...}`

3. **Try Creating Mint Voucher**
   - Should now work without CORS errors
   - Check Network tab - should call your production backend

## Still Not Working?

1. **Hard refresh browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear browser cache**
3. **Check Vercel deployment logs** - look for environment variables
4. **Verify variable name** - must be exactly `VITE_API_URL` (case-sensitive)
5. **Check all environments** - make sure it's set for Production

## Need Help?

Check your Vercel dashboard:
- Frontend → Settings → Environment Variables
- Should see `VITE_API_URL` listed
- Value should be your backend URL + `/api`

