# Deployment Guide - Render

## Backend Deployment Issues Fixed ✅

### 1. Trust Proxy Configuration
- **Issue**: `express-rate-limit` was throwing `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` error
- **Fix**: Added `app.set('trust proxy', 1)` to trust Render's proxy headers
- **Why**: Render (like Heroku, AWS) uses reverse proxies. Express needs to trust the `X-Forwarded-For` header to correctly identify client IPs for rate limiting.

### 2. CORS Configuration
- **Issue**: Frontend requests were being blocked
- **Fix**: Added `credentials: true` to CORS configuration
- **Updated**: `ALLOWED_ORIGINS` in `.env` to include both frontend and backend URLs

---

## Deployment Checklist

### Backend (https://ecom-fh0m.onrender.com)

#### Environment Variables on Render:
```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://surjeet:surjeet99@cluster0.bkqos80.mongodb.net/ECOM_DB?retryWrites=true&w=majority
JWT_SECRET=chat_marketplace_super_secret_jwt_key_2024_production_ready
ALLOWED_ORIGINS=https://ecom-frontend-qh2t.onrender.com,https://ecom-fh0m.onrender.com
MAX_IMAGE_BYTES=1048576
MAX_IMAGES=5
```

#### Build Command:
```bash
cd backend && npm install
```

#### Start Command:
```bash
cd backend && npm start
```

---

### Frontend Web (https://ecom-frontend-qh2t.onrender.com)

#### Environment Variables on Render:
```
VITE_API_URL=https://ecom-fh0m.onrender.com/api
VITE_SOCKET_URL=https://ecom-fh0m.onrender.com
```

#### Build Command:
```bash
cd web && npm install && npm run build
```

#### Start Command:
```bash
cd web && npm run preview
```

**OR** use a static site service:
- Build Command: `cd web && npm install && npm run build`
- Publish Directory: `web/dist`

---

### Frontend Mobile (React Native - Expo)

For mobile deployment, you have two options:

#### Option 1: Expo Go (Development)
Update `frontend/src/config.js`:
```javascript
export const API_URL    = 'https://ecom-fh0m.onrender.com/api';
export const SOCKET_URL = 'https://ecom-fh0m.onrender.com';
```

#### Option 2: Build APK/IPA (Production)
```bash
cd frontend
eas build --platform android  # For Android
eas build --platform ios      # For iOS
```

---

## After Deployment

### 1. Redeploy Backend
- Go to Render Dashboard → Backend Service
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- Wait for deployment to complete
- Check logs for: `[Server] Running on port 5000 in production mode`

### 2. Redeploy Frontend
- Go to Render Dashboard → Frontend Service  
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- OR **"Clear build cache & deploy"** if issues persist
- Wait for build to complete

### 3. Verify Deployment

#### Backend Health Check:
```bash
curl https://ecom-fh0m.onrender.com/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-21T...",
  "env": "production"
}
```

#### Frontend Check:
- Open: https://ecom-frontend-qh2t.onrender.com
- Open browser console (F12)
- Look for: `[Socket] Connected → <socket-id>`
- Should see connections to `ecom-fh0m.onrender.com` (NOT localhost)

#### Test Login:
- Email: `admin@test.com`
- Password: `Admin@123`

---

## Common Issues & Solutions

### Issue: "Failed to load resource: 404" for localhost
**Cause**: Frontend is using cached build with old localhost URLs  
**Solution**: Clear build cache and redeploy frontend on Render

### Issue: CORS errors
**Cause**: `ALLOWED_ORIGINS` not set correctly  
**Solution**: Verify environment variable includes frontend URL

### Issue: Socket connection fails
**Cause**: Backend not running or CORS blocking WebSocket  
**Solution**: Check backend logs, verify `trust proxy` is enabled

### Issue: Rate limit errors
**Cause**: `trust proxy` not enabled  
**Solution**: Already fixed in latest commit - redeploy backend

---

## Production URLs

- **Backend API**: https://ecom-fh0m.onrender.com/api
- **Backend Socket**: https://ecom-fh0m.onrender.com
- **Frontend Web**: https://ecom-frontend-qh2t.onrender.com
- **GitHub Repo**: https://github.com/intsurjeetkaran-droid/Ecom.git

---

## Next Steps

1. ✅ Push latest code to GitHub (Done)
2. ⏳ Redeploy backend on Render
3. ⏳ Redeploy frontend on Render
4. ⏳ Test login and socket connection
5. ⏳ Verify all features work in production

---

## Support

If you encounter issues:
1. Check Render logs for both services
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Ensure MongoDB Atlas allows connections from Render IPs (0.0.0.0/0)
