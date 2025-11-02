# Quick Deploy to Vercel

## Fastest Method: Separate Projects (Recommended)

### Backend Deployment

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Framework**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
4. Add environment variables (see `VERCEL_DEPLOYMENT.md`)
5. Deploy → Copy backend URL

### Frontend Deployment

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the same GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   - `VITE_API_URL` = your backend URL + `/api`
   - `VITE_HASHMON_CONTRACT_ADDRESS` = your contract address
   - Other vars from `frontend/env.example`
5. Deploy

### Update Backend CORS

After frontend deploys, update backend environment variable:
- `FRONTEND_URL` = your frontend Vercel URL

Done! 🎉

---

For detailed instructions, see `VERCEL_DEPLOYMENT.md`

