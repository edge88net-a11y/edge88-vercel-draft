# Deploy Edge88 Draft to Vercel

**Repository:** https://github.com/edge88net-a11y/edge88-vercel-draft  
**Status:** ✅ API client ready, awaiting Vercel deployment

---

## Quick Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/edge88net-a11y/edge88-vercel-draft)

1. Click the button above
2. Login to Vercel
3. Import the repository
4. Add environment variables (see below)
5. Deploy!

---

## Manual Deploy via Vercel Dashboard

### Step 1: Import Repository
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Search for `edge88-vercel-draft` or enter:
   ```
   https://github.com/edge88net-a11y/edge88-vercel-draft
   ```
4. Click "Import"

### Step 2: Configure Project
- **Framework Preset:** Vite
- **Root Directory:** `./` (leave default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Step 3: Set Environment Variables

Click "Environment Variables" and add these **3 variables**:

| Name | Value | Required |
|------|-------|----------|
| `VITE_API_URL` | `https://api.edge88.net/api/v1` | ✅ YES |
| `VITE_SUPABASE_URL` | `https://rbgfovckilwzzgitxjeh.supabase.co` | ✅ YES |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ YES |

**Copy from `.env.production` file if needed.**

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Visit your deployed site: `https://edge88-vercel-draft.vercel.app`

---

## Verify Deployment

### 1. Check API Connection
Open browser console on deployed site:
```javascript
fetch('https://api.edge88.net/api/v1/health')
  .then(r => r.json())
  .then(console.log);
// Should return: { status: "ok", timestamp: "..." }
```

### 2. Test Stats Endpoint
```javascript
fetch('https://api.edge88.net/api/v1/predictions/stats')
  .then(r => r.json())
  .then(console.log);
// Should return real stats from backend
```

### 3. Test Active Predictions
```javascript
fetch('https://api.edge88.net/api/v1/predictions/active')
  .then(r => r.json())
  .then(console.log);
// Should return today's predictions
```

---

## Troubleshooting

### Build Fails
**Error:** `Module not found: Can't resolve '@/lib/api'`
**Fix:** Make sure `src/lib/api.ts` exists and is committed

**Error:** `Environment variable VITE_API_URL is not defined`
**Fix:** Add environment variable in Vercel dashboard

### API Calls Fail (CORS Error)
**Error:** `Access-Control-Allow-Origin` error
**Fix:** Backend must allow `https://edge88-vercel-draft.vercel.app` origin

**Backend CORS Config:**
```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://edge88.net",
        "https://edge88-vercel-draft.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### No Data Shows Up
**Check:**
1. ✅ Backend API is running (`https://api.edge88.net/health`)
2. ✅ Environment variables are set in Vercel
3. ✅ Components are using `api` client (see migration plan)
4. ✅ Browser console for errors

---

## After Deployment

### 1. Test Core Pages
- [ ] Homepage (https://edge88-vercel-draft.vercel.app)
- [ ] Login/Signup (auth still uses Supabase)
- [ ] Dashboard (should show real stats once migrated)
- [ ] Predictions page (should show today's picks once migrated)
- [ ] Results page (should show completed games once migrated)

### 2. Compare with Production
Visit both sites side-by-side:
- **Production (Lovable):** https://edge88.net
- **Draft (Vercel):** https://edge88-vercel-draft.vercel.app

### 3. Component Migration
Now that infrastructure is ready, update components to use `api` client:
```typescript
// Before (mock data)
import { mockPredictions } from '@/lib/mockData';

// After (real API)
import { api } from '@/lib/api';
const predictions = await api.getActivePredictions();
```

See `README_DRAFT.md` for full migration plan.

---

## Custom Domain (Optional)

Once approved, you can add custom domain:

### Option 1: Subdomain
1. Vercel Dashboard → Project Settings → Domains
2. Add domain: `draft.edge88.net`
3. Add CNAME record in DNS: `draft.edge88.net` → `cname.vercel-dns.com`

### Option 2: Replace Production
1. Owner reviews draft at `edge88-vercel-draft.vercel.app`
2. If approved, add domain: `edge88.net`
3. Point DNS A record to Vercel IP
4. Original Lovable site stays at `edge88-front.lovable.app`

---

## Automatic Deploys

Every push to `main` branch triggers auto-deploy on Vercel.

```bash
# Make changes
git add .
git commit -m "feat: Update dashboard to use real API"
git push origin main

# Vercel auto-deploys in ~2 minutes
# Check: https://vercel.com/dashboard
```

---

## Rollback

If anything breaks:
1. Go to Vercel Dashboard
2. Deployments tab
3. Click "..." on previous working deployment
4. Click "Promote to Production"

---

## Support

- **Deployment Issues:** https://vercel.com/docs
- **API Issues:** Check backend at `https://api.edge88.net/health`
- **Frontend Issues:** Check browser console
- **General Questions:** See `README_DRAFT.md`

---

**Deployed URL (once deployed):** https://edge88-vercel-draft.vercel.app  
**GitHub Repo:** https://github.com/edge88net-a11y/edge88-vercel-draft  
**Backend API:** https://api.edge88.net  
**Status:** ✅ Ready to deploy
