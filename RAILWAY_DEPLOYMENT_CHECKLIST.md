# ✅ Railway Deployment Checklist

## 📋 Pre-Deployment
- [x] Code pushed to GitHub: `https://github.com/nozomu-tashiro/kaketsuke-form-web.git`
- [x] Backend code is in `/backend` directory
- [x] `package.json` exists in backend directory
- [x] `server.js` is the entry point
- [x] Railway configuration file added (`railway.json`)

---

## 🚀 Step-by-Step Railway Deployment

### Step 1: Create New Project on Railway
1. Go to: https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**

### Step 2: Connect GitHub Repository
1. Click **"Configure GitHub App"** (if first time)
2. Authorize Railway to access your GitHub
3. Select repository: **`nozomu-tashiro/kaketsuke-form-web`**
4. Click **"Deploy Now"**

### Step 3: Configure Root Directory
**⚠️ CRITICAL: Railway needs to know where the backend code is!**

1. Click on the deployed service (card)
2. Go to **"Settings"** tab
3. Find **"Root Directory"**
4. Set to: `backend`
5. Click **"Update"** or **"Save"**

### Step 4: Verify Start Command
1. Still in **"Settings"** tab
2. Find **"Start Command"**
3. Should be: `node server.js`
4. If not set, add it manually

### Step 5: Add Environment Variables
1. Click **"Variables"** tab
2. Click **"New Variable"**
3. Add the following:
   ```
   Name: NODE_ENV
   Value: production
   ```
4. Click **"Add"**

### Step 6: Generate Public Domain
1. Go back to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. **COPY THE URL** (example: `https://kaketsuke-backend-production.up.railway.app`)

**💾 SAVE THIS URL! You'll need it for:**
- Vercel frontend deployment
- CORS configuration

---

## 🧪 Test Backend Deployment

Once deployed, test the backend API:

### Test 1: Health Check
Open in browser or use curl:
```bash
curl https://YOUR-RAILWAY-URL.railway.app/api/health
```

Expected response:
```json
{"status": "ok", "message": "Backend is running"}
```

### Test 2: API Endpoint Test
```bash
curl -X POST https://YOUR-RAILWAY-URL.railway.app/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

Should return PDF data or an error message.

---

## 🔧 Configure CORS (After Vercel Deployment)

**⚠️ DO THIS AFTER you deploy the frontend to Vercel!**

1. Deploy frontend to Vercel first (get the URL)
2. Come back to Railway
3. Go to **"Variables"** tab
4. Add:
   ```
   Name: CORS_ORIGIN
   Value: https://YOUR-VERCEL-URL.vercel.app
   ```
5. Railway will automatically redeploy

---

## 📊 Monitor Deployment

### Check Deployment Status
1. Go to **"Deployments"** tab
2. View latest deployment
3. Check **"Build Logs"** and **"Deploy Logs"**

### View Application Logs
1. Click on service card
2. View real-time logs at the bottom
3. Look for:
   - ✅ "Server running on port 5000" (or PORT from environment)
   - ✅ No error messages

---

## ❌ Troubleshooting

### Problem: Build Failed
**Check:**
- Root Directory is set to `backend`
- `package.json` exists in backend directory
- All dependencies are listed in `package.json`

**Solution:**
1. Go to Deployments → Latest Deployment
2. Check Build Logs
3. Fix any missing dependencies
4. Commit and push changes (auto-redeploys)

---

### Problem: Deployment Successful but Server Won't Start
**Check:**
- Start Command is `node server.js`
- `server.js` exists in backend directory
- Port binding is correct (use `process.env.PORT`)

**Check Deploy Logs:**
1. Go to Deployments → Latest Deployment
2. Check Deploy Logs
3. Look for error messages

---

### Problem: CORS Errors
**Symptoms:**
- Frontend can't connect to backend
- Browser console shows CORS policy errors

**Solution:**
1. Add `CORS_ORIGIN` environment variable
2. Set to Vercel frontend URL
3. Ensure backend code has CORS middleware configured

---

### Problem: 404 Not Found on API Calls
**Check:**
- Backend URL is correct
- API routes are properly defined
- Root directory is set to `backend`

---

## 🎯 Expected Results

After successful deployment:

✅ **Railway Dashboard shows:**
- Status: **Running** (green)
- Latest deployment: **Success**
- Health checks: **Passing**

✅ **Backend URL accessible:**
- Opens in browser without errors
- API endpoints respond correctly

✅ **Environment variables set:**
- `NODE_ENV=production`
- `CORS_ORIGIN=<vercel-url>` (after frontend deployment)

---

## 📋 Next Steps

Once Railway backend is deployed successfully:

1. **Get the Railway backend URL** (from Networking section)
2. **Deploy frontend to Vercel** (follow Vercel guide)
3. **Add CORS_ORIGIN** to Railway (with Vercel URL)
4. **Test end-to-end** (frontend → backend → PDF generation)

---

## 🔗 Important URLs

- **Railway Dashboard**: https://railway.app/dashboard
- **GitHub Repository**: https://github.com/nozomu-tashiro/kaketsuke-form-web
- **Backend URL**: (to be generated after deployment)
- **Frontend URL**: (to be generated after Vercel deployment)

---

## 💡 Pro Tips

1. **Auto-Deploy**: Every push to `main` branch will trigger automatic redeployment
2. **Environment Variables**: Can be updated anytime; causes automatic redeploy
3. **Logs**: Keep logs tab open during first deployment to monitor
4. **Domain**: Can add custom domain later in Settings → Networking
5. **Rollback**: Can rollback to previous deployment from Deployments tab

---

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Check this checklist
3. Review backend code for errors
4. Check Railway community/documentation

---

**Last Updated**: 2025-12-13
**Project**: 駆付けサービス入会申込書PDF出力システム
**Repository**: nozomu-tashiro/kaketsuke-form-web
