# Vercel Deployment Guide - QualityVoice

## ✅ Fixed Issues

### 1. Double `app.listen()` Error ✓
**Problem:** Server crashed with "address already in use"  
**Fixed:** Removed duplicate `app.listen()` call and kept only one at the end after all middleware setup

### 2. CORS Blocking ✓
**Problem:** Frontend from Vercel domain couldn't connect to API  
**Fixed:** Changed hardcoded localhost URLs to environment variable `ALLOWED_ORIGINS`  
**Setup:** In Vercel Environment Variables, set:
```
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

### 3. Missing Environment Validation ✓
**Problem:** App crashed silently if `MONGO_URI` wasn't set  
**Fixed:** Added validation check that exits with helpful error message

### 4. Client API Configuration ✓
**Problem:** Hardcoded localhost fallback  
**Fixed:** Added proper Vite environment variable handling with ProductionURL fallback

---

## ⚠️ REMAINING ISSUES - Must Fix Before Deploying

### Issue #1: File Upload Storage 🔴 **CRITICAL**
**Problem:** Your app stores uploaded files in `server/uploads/` folder  
Vercel's filesystem is **read-only** - files uploaded will be LOST after cold restart

**Solution:** Use cloud storage instead:

#### Option A: Cloudinary (Easiest - Free tier)
```bash
npm install cloudinary next-cloudinary
```

#### Option B: AWS S3
```bash
npm install aws-sdk
```

#### Option C: Firebase Storage
```bash
npm install firebase
```

**Recommended:** Start with **Cloudinary** (simplest integration)

---

### Issue #2: Setup Environment Variables

**Server (.env or Vercel Settings):**
```
PORT=
MONGO_URI=mongodb+srv://username:password@your-cluster.mongodb.net/qualityvoice
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
JWT_SECRET=your-secret-key-here
```

**Client (.env.production):**
```
VITE_API_URL=https://your-api-domain.vercel.app
```

---

### Issue #3: Database Setup
- Sign up for **MongoDB Atlas** (free tier available at mongodb.com)
- Create a cluster and user
- Get your connection string and add to `MONGO_URI`

---

## 🚀 Deployment Steps

### Step 1: Prepare Code
```bash
# Copy .env.example files as reference
cp server/.env.example server/.env  # Then fill with real values
cp client/.env.example client/.env.development
cp client/.env.production client/.env.production  # Update API URL
```

### Step 2: Create Vercel Projects

**Deploy Backend API:**
```bash
cd server
vercel --prod
# Vercel will guide you through setup
```
Copy the deployed API domain (e.g., `https://qualityvoice-api.vercel.app`)

**Deploy Frontend:**
```bash
cd client
# Update .env.production with backend API URL
echo "VITE_API_URL=https://qualityvoice-api.vercel.app" > .env.production
vercel --prod
```

### Step 3: Configure Vercel Environment Variables

**For Backend (in Vercel Dashboard):**
1. Go to Settings → Environment Variables
2. Add:
   - `MONGO_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Random secure string
   - `ALLOWED_ORIGINS` = Your frontend Vercel URL
   - `NODE_ENV` = production

**For Frontend (in Vercel Dashboard):**
1. Go to Settings → Environment Variables  
2. Add:
   - `VITE_API_URL` = Your backend Vercel URL

### Step 4: Test Connection
- Visit your frontend URL
- Try to login - if it works, backend is connected ✓

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
cd server && npm install
cd ../client && npm install
```

### CORS errors in browser console
- Check `ALLOWED_ORIGINS` variable is set correctly in Vercel
- Should include your frontend domain

### MongoDB connection failures
- Verify `MONGO_URI` is correct in Vercel environment variables
- Check MongoDB Atlas whitelist includes Vercel IPs (usually set to 0.0.0.0/0)

### File uploads don't persist
This is expected behavior on Vercel. You MUST implement cloud storage (see Issue #1)

---

## 📋 Checklist Before Going Live

- [ ] MongoDB Atlas cluster created and credentials saved
- [ ] JWT_SECRET generated (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel  
- [ ] Environment variables set in both Vercel projects
- [ ] Test login/signup works
- [ ] Upload solution implemented (Cloudinary/S3/Firebase)
- [ ] ALLOWED_ORIGINS includes your frontend domain

---

## 🔗 Useful Links
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Cloudinary Upload Widget](https://cloudinary.com/documentation)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
