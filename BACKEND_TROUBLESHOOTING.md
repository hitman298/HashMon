# Backend "Route not found" Troubleshooting Guide

If you're getting `{"error":"Route not found"}` from your backend, follow these steps:

## Quick Fixes

### 1. Verify Vercel Configuration

Make sure your backend project in Vercel has:
- **Root Directory**: Set to `backend`
- **Build Command**: Leave empty (or `npm install`)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### 2. Check Entry Point

Ensure `backend/vercel.json` points to `api/index.js`:
```json
{
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ]
}
```

### 3. Test Endpoints

Try these URLs after deployment:

- **Root**: `https://your-backend.vercel.app/`
- **Health**: `https://your-backend.vercel.app/health`
- **API Info**: `https://your-backend.vercel.app/api`
- **Player Stats**: `https://your-backend.vercel.app/api/player/stats/0x...`

### 4. Check Environment Variables

Make sure all required environment variables are set in Vercel:
- `NODE_ENV=production`
- `PHAROS_RPC_URL`
- `BACKEND_PRIVATE_KEY`
- `HASHMON_CONTRACT_ADDRESS`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `FRONTEND_URL` (your frontend Vercel URL)

### 5. Check Deployment Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check the "Build Logs" and "Function Logs"
4. Look for any errors or warnings

## Common Issues

### Issue: Routes return 404

**Solution**: 
- Ensure `backend/api/index.js` exists and exports the Express app
- Check that `backend/vercel.json` references `api/index.js`
- Redeploy after making changes

### Issue: CORS errors

**Solution**:
- Add your frontend URL to `FRONTEND_URL` environment variable
- Include `https://your-frontend.vercel.app` (no trailing slash)
- Redeploy backend after updating environment variables

### Issue: Environment variables not loading

**Solution**:
- Check variable names match exactly (case-sensitive)
- Ensure no extra spaces in variable values
- Redeploy after adding/modifying variables
- Use Vercel dashboard to set variables (not `.env` file)

### Issue: Path resolution errors

**Solution**:
- Make sure all relative paths in `server.js` work from `backend/` directory
- Check that `require('./routes/...')` paths are correct
- Verify `dotenv` config path is correct

## Testing Locally

Before deploying, test locally:

```bash
cd backend
npm install
npm start
```

Then test:
- `http://localhost:3000/` - Should show API info
- `http://localhost:3000/health` - Should show health status
- `http://localhost:3000/api` - Should show API endpoints

## Debugging Steps

1. **Check the root endpoint first**:
   ```bash
   curl https://your-backend.vercel.app/
   ```
   Should return available endpoints.

2. **Check health endpoint**:
   ```bash
   curl https://your-backend.vercel.app/health
   ```
   Should return `{"status":"healthy",...}`

3. **Check specific API route**:
   ```bash
   curl https://your-backend.vercel.app/api/player/stats/0x1234...
   ```

4. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Functions tab
   - Click on your function
   - Check runtime logs for errors

## Still Not Working?

1. **Redeploy**: Sometimes a redeploy fixes issues
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy" on latest deployment

2. **Check file structure**: Ensure files are in correct locations:
   ```
   backend/
   ├── api/
   │   └── index.js    ← Must exist
   ├── routes/
   ├── services/
   ├── server.js
   └── vercel.json     ← Must reference api/index.js
   ```

3. **Try alternative setup**: If still not working, try deploying without `backend/vercel.json` and let Vercel auto-detect, or use the root `vercel.json` approach.

4. **Check Express routes**: Ensure all route files export their router correctly:
   ```javascript
   module.exports = router;
   ```

## Need More Help?

- Check Vercel deployment logs
- Review error messages in Function Logs
- Test endpoints with curl/Postman
- Verify all environment variables are set correctly

