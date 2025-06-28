# 🔧 Environment Variables Setup for Railway

## Backend Service Environment Variables

Copy and paste these environment variables in your **Backend Service** in Railway:

```bash
# Database Configuration (Auto-populated by Railway MySQL service)
# These will be automatically filled when you connect MySQL service
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}

# Server Configuration
NODE_ENV=production
PORT=${{PORT}}
HOST=0.0.0.0

# Frontend URL for CORS (UPDATE THIS with your actual frontend Railway URL)
FRONTEND_URL=https://your-frontend-service-name.up.railway.app

# File Upload Settings (Optional - using defaults)
MAX_FILE_SIZE=10485760
UPLOAD_PATH=backend/uploads
```

## Frontend Service Environment Variables

Copy and paste these environment variables in your **Frontend Service** in Railway:

```bash
# Backend API URL (UPDATE THIS with your actual backend Railway URL)
VITE_API_BASE_URL=https://your-backend-service-name.up.railway.app

# App Configuration
VITE_APP_NAME=Ruhil Future Technologies
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

## 📝 Step-by-Step Setup

### 1. Deploy MySQL Database First
- Add MySQL service to your Railway project
- Railway will auto-generate connection variables

### 2. Deploy Backend Service
- Set root directory to `backend`
- Add the backend environment variables above
- The `DB_*` variables will auto-populate when MySQL service is connected

### 3. Deploy Frontend Service  
- Set root directory to `forntend`
- Add the frontend environment variables above

### 4. Update URLs
After both services are deployed:

1. **Get Backend URL**: Copy the URL from your backend service
2. **Update Frontend**: Set `VITE_API_BASE_URL` to your backend URL
3. **Get Frontend URL**: Copy the URL from your frontend service  
4. **Update Backend**: Set `FRONTEND_URL` to your frontend URL

### 5. Link Services (Important!)
In Railway, make sure to:
- Connect MySQL service to Backend service
- This will auto-populate the `DB_*` environment variables

## 🔗 Service URLs Format

Railway URLs typically follow this pattern:
- Backend: `https://backend-production-xxxx.up.railway.app`
- Frontend: `https://frontend-production-xxxx.up.railway.app`

## ✅ Verification

After setup, verify:
- [ ] Backend service starts without errors
- [ ] Database tables are created automatically
- [ ] Frontend can make API calls to backend
- [ ] File uploads work correctly
- [ ] CORS is properly configured

## 🚨 Important Notes

1. **Database Auto-Setup**: The backend automatically creates database tables on startup
2. **File Storage**: Files are stored locally in `backend/uploads` (ephemeral storage)
3. **CORS**: Configured to accept requests from Railway domains automatically
4. **No Cloudinary**: This setup uses local file storage, not cloud storage

## 🔧 Troubleshooting

### Backend won't start?
- Check if MySQL service is connected
- Verify `DB_*` variables are populated
- Check logs for database connection errors

### Frontend can't reach backend?
- Verify `VITE_API_BASE_URL` points to correct backend URL
- Check backend CORS settings with `FRONTEND_URL`

### File uploads failing?
- Check if uploads directory is created
- Verify file size limits (10MB default)
- Monitor backend logs for upload errors 