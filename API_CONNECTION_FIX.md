# Fix Network Error - Backend API Connection

## Problem
Getting "Network Error" when trying to create mint voucher or call backend API.

## Quick Fix Checklist

### 1. Check Environment Variables

**In Vercel/Render Dashboard:**

Verify `VITE_API_URL` is set correctly:
- Should be: `https://your-backend-url.vercel.app/api` (or `.onrender.com/api`)
- **Must end with `/api`**
- Must be the full URL (not relative)

**Check in browser console:**
Open DevTools (F12) → Console tab, look for:
```
🔧 API Configuration: { VITE_API_URL: "...", API_BASE_URL: "..." }
```

### 2. Verify Backend is Running

Test backend directly:
```bash
# Replace with your actual backend URL
curl https://your-backend-url.vercel.app/health
```

Should return:
```json
{"status":"healthy","timestamp":"...","version":"1.0.0"}
```

### 3. Check CORS Configuration

Backend must allow your frontend URL:

**In backend environment variables:**
```
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Or for Render:**
```
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### 4. Common Issues

#### Issue: API URL Not Set
**Symptom**: Console shows `VITE_API_URL: undefined`

**Fix**:
1. Go to Vercel/Render → Project Settings → Environment Variables
2. Add: `VITE_API_URL=https://your-backend-url/api`
3. Redeploy frontend

#### Issue: Wrong API URL Format
**Symptom**: API calls fail with CORS or 404

**Fix**:
- ✅ Correct: `https://backend.vercel.app/api`
- ❌ Wrong: `https://backend.vercel.app` (missing `/api`)
- ❌ Wrong: `/api` (relative URL won't work)

#### Issue: Backend Not Deployed
**Symptom**: Network error, can't reach backend

**Fix**:
1. Deploy backend first
2. Copy backend URL
3. Update frontend `VITE_API_URL`
4. Redeploy frontend

#### Issue: CORS Blocking
**Symptom**: CORS error in console

**Fix**:
1. Check backend `FRONTEND_URL` environment variable
2. Must match your frontend URL exactly
3. No trailing slash
4. Redeploy backend after updating

## Step-by-Step Fix

### For Vercel Deployment

1. **Get Backend URL**
   - Go to backend project in Vercel
   - Copy the deployment URL (e.g., `https://hashmon-backend.vercel.app`)

2. **Update Frontend Environment Variable**
   - Go to frontend project → Settings → Environment Variables
   - Set: `VITE_API_URL=https://hashmon-backend.vercel.app/api`
   - **Important**: Add `/api` at the end

3. **Update Backend CORS**
   - Go to backend project → Settings → Environment Variables
   - Set: `FRONTEND_URL=https://hashmon-frontend.vercel.app`
   - No trailing slash

4. **Redeploy Both**
   - Frontend: Redeploy after adding `VITE_API_URL`
   - Backend: Redeploy after adding `FRONTEND_URL`

### For Render Deployment

1. **Get Backend URL**
   - Go to backend service in Render
   - Copy the service URL (e.g., `https://hashmon-backend.onrender.com`)

2. **Update Frontend Environment Variable**
   - Go to frontend static site → Environment
   - Set: `VITE_API_URL=https://hashmon-backend.onrender.com/api`

3. **Update Backend CORS**
   - Go to backend service → Environment
   - Set: `FRONTEND_URL=https://hashmon-frontend.onrender.com`

4. **Redeploy Both**
   - Both will auto-redeploy on save

## Testing

### Test Backend
```bash
curl https://your-backend-url/health
curl https://your-backend-url/api
```

### Test Frontend API Call
Open browser console (F12) and run:
```javascript
// Check API URL
console.log('API URL:', import.meta.env.VITE_API_URL)

// Test API call
fetch(import.meta.env.VITE_API_URL + '/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Debugging Steps

1. **Check Browser Console**
   - Look for API configuration log
   - Check for CORS errors
   - Check network tab for failed requests

2. **Check Network Tab**
   - Open DevTools → Network tab
   - Try creating mint voucher
   - Look for failed request
   - Check request URL and response

3. **Check Backend Logs**
   - Vercel: Functions → Logs
   - Render: Service → Logs tab
   - Look for incoming requests

4. **Verify URLs Match**
   - Frontend `VITE_API_URL` should match backend URL + `/api`
   - Backend `FRONTEND_URL` should match frontend URL exactly

## Still Not Working?

1. **Check browser console** for specific error messages
2. **Test backend directly** with curl or Postman
3. **Verify environment variables** are set correctly
4. **Check deployment logs** for build/runtime errors
5. **Try hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)

## Example Configuration

### Vercel Example

**Backend Project:**
- URL: `https://hashmon-backend.vercel.app`
- Env Var: `FRONTEND_URL=https://hashmon-frontend.vercel.app`

**Frontend Project:**
- URL: `https://hashmon-frontend.vercel.app`
- Env Var: `VITE_API_URL=https://hashmon-backend.vercel.app/api`

### Render Example

**Backend Service:**
- URL: `https://hashmon-backend.onrender.com`
- Env Var: `FRONTEND_URL=https://hashmon-frontend.onrender.com`

**Frontend Static Site:**
- URL: `https://hashmon-frontend.onrender.com`
- Env Var: `VITE_API_URL=https://hashmon-backend.onrender.com/api`

---

**After fixing, test the mint voucher creation again!**

