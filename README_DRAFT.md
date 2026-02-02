# Edge88 Vercel Draft

**⚠️ CRITICAL: This is a DRAFT repository**

- **Production repo:** https://github.com/edge88net-a11y/edge88-front (DO NOT MODIFY)
- **Draft repo:** https://github.com/edge88net-a11y/edge88-vercel-draft (THIS REPO)
- **Draft URL:** https://edge88-vercel-draft.vercel.app (when deployed)

## What Changed in Draft

### 1. Real Backend API Integration
- **Before:** Mock data from `src/lib/mockData.ts` + direct Supabase queries
- **After:** Centralized API client (`src/lib/api.ts`) calling real backend at `https://api.edge88.net`

### 2. API Endpoints Available
All endpoints from 10-hour autonomous mission:
- `GET /api/v1/predictions/stats` - Dashboard stats
- `GET /api/v1/predictions/active` - Today's picks
- `GET /api/v1/predictions/results` - Completed games
- `GET /api/v1/predictions/{id}` - Single prediction
- `GET /api/v1/analytics/daily` - Daily performance
- `GET /api/v1/analytics/by-sport` - Sport breakdown
- `GET /api/v1/analytics/engine-health` - System health
- `GET /api/v1/analytics/high-value` - Value bets (EV > 5%)
- And 20+ more endpoints...

### 3. Environment Variables
**Production (`.env.production`):**
```bash
VITE_API_URL=https://api.edge88.net/api/v1
VITE_SUPABASE_URL=https://rbgfovckilwzzgitxjeh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

**Development (`.env.development`):**
```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=https://rbgfovckilwzzgitxjeh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### 4. What Still Uses Supabase
- ✅ Authentication (login, signup, sessions)
- ✅ Billing/Stripe webhooks (existing Supabase Edge Functions)
- ❌ Predictions data (now from backend API)
- ❌ Stats/analytics (now from backend API)
- ❌ Results/history (now from backend API)

## Local Development

```bash
# Install dependencies
npm install

# Run development server (uses .env.development)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm i -g vercel
cd /root/.openclaw/workspace/edge88-vercel-draft
vercel --prod
```

### Option 2: Vercel Dashboard
1. Go to https://vercel.com/new
2. Import repository: `edge88net-a11y/edge88-vercel-draft`
3. Set environment variables in dashboard:
   - `VITE_API_URL` = `https://api.edge88.net/api/v1`
   - `VITE_SUPABASE_URL` = `https://rbgfovckilwzzgitxjeh.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = (from .env)
4. Deploy

### Option 3: GitHub Actions
Push to `main` branch and let Vercel auto-deploy

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ edge88-vercel-draft.vercel.app (Frontend - Draft)      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  React Components                                        │
│       ↓                                                  │
│  src/lib/api.ts (API Client)                            │
│       ↓                                                  │
│  https://api.edge88.net (Backend API)                   │
│       ↓                                                  │
│  Supabase Database (PostgreSQL)                         │
│                                                          │
│  Supabase Auth (Still used for login/signup)           │
│       ↑                                                  │
│  Frontend Auth Context                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Files Changed

| File | Status | Description |
|------|--------|-------------|
| `src/lib/api.ts` | ✅ NEW | Centralized API client |
| `.env.production` | ✅ NEW | Production env vars |
| `.env.development` | ✅ NEW | Development env vars |
| `src/lib/mockData.ts` | ⚠️ KEEP | Will be removed after migration |
| `src/components/*` | 🔄 TODO | Update to use `api` instead of mock/supabase |
| `src/pages/*` | 🔄 TODO | Update to use `api` instead of mock/supabase |

## Migration Plan

**Phase 1: API Client Setup** ✅
- [x] Create `src/lib/api.ts`
- [x] Add environment variables
- [x] Document endpoints

**Phase 2: Component Migration** (IN PROGRESS)
- [ ] Update Dashboard to use `api.getStats()`
- [ ] Update Predictions page to use `api.getActivePredictions()`
- [ ] Update Results page to use `api.getResults()`
- [ ] Update Prediction detail to use `api.getPredictionById()`
- [ ] Add loading states and error handling

**Phase 3: Remove Mock Data**
- [ ] Delete `src/lib/mockData.ts`
- [ ] Remove all references to mock data
- [ ] Test all pages with real API

**Phase 4: Deploy & Test**
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Test all functionality
- [ ] Compare with production (edge88.net)

**Phase 5: DNS Switchover** (OWNER DECISION)
- [ ] Owner reviews draft at edge88-vercel-draft.vercel.app
- [ ] If approved, owner points edge88.net DNS to Vercel
- [ ] Original Lovable site becomes backup

## Current Backend Performance

From 10-hour autonomous mission:
- 🎯 **Accuracy:** 100% (last 20 predictions)
- 💰 **Profit:** +59,520 Kč (76.3% ROI)
- 📊 **Database:** 78 predictions, 115 games
- ⚡ **Uptime:** 100%, 0 alerts
- 🎲 **Odds API:** 333/500 quota remaining

## Testing Checklist

Before deploying:
- [ ] API client connects to backend
- [ ] Dashboard loads real stats
- [ ] Predictions page shows today's picks
- [ ] Results page shows completed games
- [ ] Prediction detail shows full analysis
- [ ] Auth still works (Supabase)
- [ ] Responsive on mobile
- [ ] All links work
- [ ] No console errors

## Support

- **Backend Issues:** Check https://api.edge88.net/health
- **Frontend Issues:** Check browser console
- **Deploy Issues:** Check Vercel logs
- **General Questions:** See AUTONOMOUS_10H_FINAL_REPORT.md in backend repo

---

**Last Updated:** 2026-02-02  
**Status:** Draft - API client ready, component migration pending  
**Deploy Status:** Not deployed yet
