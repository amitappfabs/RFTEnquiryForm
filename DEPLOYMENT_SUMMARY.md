# 🚀 Enquiry Form - Railway Deployment Summary

## 📋 Codebase Overview

### Backend (Node.js + Express + MySQL)
- **Main File**: `backend/server.js`
- **Database**: MySQL with connection pooling (`backend/config/db.js`)
- **File Uploads**: Local storage in `backend/uploads/` (multer middleware)
- **API Endpoints**:
  - `POST /upload` - Submit candidate form with file upload
  - `GET /api/candidates` - List all candidates (paginated)
  - `GET /candidate/:id` - Get specific candidate details
  - `GET /health` - Health check endpoint
- **Auto DB Setup**: `backend/scripts/init-db.js` creates tables on deployment

### Frontend (React + TypeScript + Vite)
- **Main File**: `forntend/src/App.tsx`
- **Form Component**: `forntend/src/components/ContactForm.tsx` (multi-step form)
- **List Component**: `forntend/src/components/CandidatesList.tsx`
- **API Config**: `forntend/src/config/api.ts` (environment-based URLs)
- **Build Tool**: Vite with TypeScript and TailwindCSS

### Database Schema
- **Candidates** - Main candidate data
- **Candidate_skills** - Technical skills
- **candidate_preferred_job_location** - Job location preferences  
- **candidate_languages_known** - Language skills

## 🎯 Railway Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend       │    │   Backend       │    │   MySQL         │
│  (React/Vite)   │◄──►│ (Node.js/Express│◄──►│   Database      │
│  Port: Auto     │    │  Port: Auto     │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Key Modifications Made

### 1. **Removed Health Checks** (as requested)
- Simplified `/health` endpoint
- Removed complex database health monitoring
- Updated `railway.toml` files

### 2. **Fixed CORS for Railway**
```javascript
// Backend - supports Railway domains automatically
origin: [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://*.railway.app',
  /railway\.app$/
]
```

### 3. **Environment-Based API URLs**
```typescript
// Frontend - uses environment variables
BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
```

### 4. **Auto Database Initialization**
- Script runs before server starts: `node scripts/init-db.js && node server.js`
- Creates all required tables automatically
- Handles Railway MySQL service connection

### 5. **Local File Storage Setup**
- Files stored in `backend/uploads/`
- Multer configured for PDF uploads (10MB limit)
- Static file serving via Express: `/uploads` endpoint

## 📋 Environment Variables

### Backend Service
```bash
# Database (auto-populated by Railway MySQL)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}

# Server
NODE_ENV=production
PORT=${{PORT}}
HOST=0.0.0.0
FRONTEND_URL=https://your-frontend.railway.app
```

### Frontend Service
```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_APP_NAME=Ruhil Future Technologies
NODE_ENV=production
```

## 🏗️ Build & Start Commands

### Backend
- **Build**: Auto-detected by Nixpacks
- **Start**: `npm start` (runs `node scripts/init-db.js && node server.js`)

### Frontend  
- **Build**: `npm run build` (auto-detected)
- **Start**: `npm run preview`

## 🗂️ Project Structure
```
EnquiryForm/
├── backend/
│   ├── config/db.js          # Database connection
│   ├── controllers/          # API controllers
│   ├── middlewares/          # Upload middleware
│   ├── scripts/init-db.js    # Auto DB setup
│   ├── server.js             # Main server
│   ├── package.json          # Dependencies & scripts
│   └── railway.toml          # Railway config
├── forntend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── config/api.ts     # API configuration
│   │   └── App.tsx           # Main app
│   ├── package.json          # Dependencies & scripts
│   └── railway.toml          # Railway config
└── database.sql              # Database schema
```

## ✅ Deployment Checklist

1. **Setup Railway Project** with 3 services
2. **Deploy MySQL Database** first
3. **Deploy Backend** with environment variables
4. **Deploy Frontend** with environment variables  
5. **Update URLs** in environment variables after deployment
6. **Test Application**:
   - [ ] Form submission works
   - [ ] File uploads work
   - [ ] Candidate list displays
   - [ ] CORS is working
   - [ ] Database tables created

## 🚨 Important Notes

- **File Storage**: Using local filesystem (ephemeral on Railway)
- **No Cloudinary**: Removed cloud storage dependencies
- **Auto DB Setup**: Tables created automatically on backend startup
- **CORS**: Configured for Railway domains
- **Health Checks**: Simplified as requested

## 🔧 Post-Deployment

After successful deployment:
1. Test form submission end-to-end
2. Verify file uploads work and files are accessible
3. Check candidate list pagination
4. Monitor logs for any errors
5. Consider adding persistent storage for files if needed

The application is now ready for production use on Railway! 🎉 