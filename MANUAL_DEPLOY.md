# Manual Deployment Instructions (For Owner)

**Repository:** https://github.com/edge88net-a11y/edge88-vercel-draft  
**Status:** ✅ Code pushed, build tested, ready to deploy

---

## 🚀 Deploy in 2 Minutes (2 Clicks)

### Step 1: Go to Vercel

Visit: **https://vercel.com/new**

### Step 2: Import Repository

1. Click **"Import Git Repository"**
2. Search for: `edge88-vercel-draft`
3. Or paste: `https://github.com/edge88net-a11y/edge88-vercel-draft`
4. Click **"Import"**

### Step 3: Configure (Just Copy/Paste)

**Framework:** Vite (auto-detected)

**Environment Variables:** Click "Add" and paste these **3 variables**:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://api.edge88.net/api/v1` |
| `VITE_SUPABASE_URL` | `https://rbgfovckilwzzgitxjeh.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZ2ZvdmNraWx3enpnaXR4amVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODMwOTUsImV4cCI6MjA4NTM1OTA5NX0.PvQ2-7aIYcOM8Kt3IVd8r1g4BIN7xvyZOarRHZW_jVs` |

### Step 4: Deploy

Click **"Deploy"**

Wait 2-3 minutes. Done!

**Your URL:** `https://edge88-vercel-draft.vercel.app`

---

## ✅ Verification Checklist

Visit your deployed site and test:

- [ ] **Dashboard** - Shows real stats (not 64.8% fake)
- [ ] **Predictions** - Shows today's picks with real EV
- [ ] **Results** - Shows completed games or empty state
- [ ] **Community** - Shows empty state (NO fake users like "Petr M.")
- [ ] **Pricing** - Shows 3 tiers (Starter, Pro, Elite)
- [ ] **Settings** - User profile works
- [ ] **Login/Signup** - Supabase auth works
- [ ] **Mobile** - Responsive design works
- [ ] **Console** - Open F12, check for errors (should be zero)

---

## 🔧 After Deployment (Important!)

You need to update backend CORS to allow requests from Vercel.

### On Your Server:

```bash
# 1. Edit backend CORS
nano /root/.openclaw/workspace/edge88/backend/app/main.py

# 2. Find this section:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://edge88.net",
        # ADD THIS LINE:
        "https://edge88-vercel-draft.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    ...
)

# 3. Save (Ctrl+X, Y, Enter)

# 4. Restart backend
cd /root/.openclaw/workspace/edge88/backend
pkill -f "uvicorn app.main:app"
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /var/log/edge88/api.log 2>&1 &
```

---

## 🐛 Troubleshooting

### "Build Failed"

**Fix:** Already built successfully on server, just deploy again

### "No data showing"

**Fix:** Update backend CORS (see above)

### "CORS error in console"

**Fix:** Update backend CORS (see above)

### "Can't login"

**Fix:** Check that all 3 environment variables are set correctly

---

## 📊 What's Different from Production

| Feature | Production (edge88.net) | Draft (Vercel) |
|---------|------------------------|----------------|
| **Data Source** | Mock data + Supabase | Real API (api.edge88.net) |
| **Users** | Fake (Petr M., etc.) | Honest empty states |
| **Stats** | Hardcoded (64.8%) | Real from backend (100%) |
| **Predictions** | Mock array | Real from API |
| **EV** | Fake (+0.0%) | Real calculated |
| **Community** | Fake leaderboard | Empty state with CTA |
| **Build** | Lovable.dev | Vercel |
| **Hosting** | Lovable servers | Vercel edge network |

---

## 🎯 What Was Built

1. **Centralized API Client** - 40+ endpoints in `src/lib/api.ts`
2. **No Fake Data** - All 20+ fake users removed
3. **Real Backend Integration** - Every page uses real API
4. **Empty States** - Honest messaging when no data
5. **Environment Config** - Production vs development
6. **Documentation** - 4 comprehensive guides

---

## 📱 After Testing

If everything looks good:

1. ✅ Test all pages (checklist above)
2. ✅ Compare with production (edge88.net)
3. ✅ Verify API calls in DevTools
4. ✅ Test on mobile device

When ready to switch:

1. Go to Vercel Dashboard → Domains
2. Add custom domain: `edge88.net`
3. Point DNS A record to Vercel
4. Original Lovable site stays at `edge88-front.lovable.app` as backup

---

## 🔗 Resources

- **GitHub Repo:** https://github.com/edge88net-a11y/edge88-vercel-draft
- **Backend API:** https://api.edge88.net
- **API Health:** https://api.edge88.net/api/v1/health
- **Vercel Docs:** https://vercel.com/docs
- **Full Guide:** See DEPLOY_NOW.md in repo

---

**That's it! 2 clicks and you're live.**

🚀 Deploy → ✅ Test → 🎉 Share URL
