# QueryForm Frontend Deployment Guide

## Overview
This is the frontend for the Ruhil Future Technologies candidate enquiry form. It's a React + TypeScript application built with Vite and styled with TailwindCSS.

## Pre-Deployment Setup

### 1. Environment Variables
Create these environment variables in Railway:

```
VITE_API_BASE_URL=https://your-backend-service.railway.app
VITE_APP_NAME=Ruhil Future Technologies
VITE_APP_VERSION=1.0.0
```

Replace `your-backend-service.railway.app` with your actual backend service URL.

### 2. Dependencies
The project uses:
- React 18+ with TypeScript
- Axios for API calls
- Lucide React for icons
- TailwindCSS for styling
- Vite for building

## Railway Deployment Steps

### 1. Create New Service
1. Go to Railway dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository
4. Choose the `queryform` folder as the root directory

### 2. Configure Build Settings
Railway should automatically detect this as a Node.js project. If not:

1. Set Build Command: `npm install && npm run build`
2. Set Start Command: `npm run preview`
3. Set Root Directory: `queryform`

### 3. Environment Variables
Add the environment variables listed above in the Railway service settings.

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## Frontend Features

### Multi-Step Form
- 9-step candidate registration form
- Form validation on each step
- Auto-save progress (when logged in)
- File upload for resume

### Candidate Management
- View all submitted candidates
- Filter by name or email
- Pagination support
- Detailed candidate information

### Authentication (Mock)
- Sign in/Sign up modal
- Auto-fill user information
- Session persistence

## API Integration

The frontend connects to your backend API with these endpoints:

- `POST /upload` - Submit candidate form with file
- `GET /api/candidates` - Fetch candidates list
- `GET /candidate/:id` - Get candidate details
- `GET /health` - Health check

## Form Data Mapping

The frontend form data is mapped to your backend API structure:

```typescript
{
  fullName, dob, gender, mobile, altMobile, email,
  currentCity, homeTown, willingToRelocate, preferredLocations,
  qualification, course, college, affiliatedUniv, graduationYear, marks, allSemCleared,
  techSkills, certifications, hasInternship, projectDesc, github,
  preferredRole, joining, shifts, expectedCTC,
  source, onlineTest, laptop, languages, aadhar, pan, passport
}
```

## Troubleshooting

### Build Issues
If you encounter build failures:
1. Check that all environment variables are set
2. Verify the backend URL is accessible
3. Review build logs for specific errors

### API Connection Issues
- Ensure CORS is configured in backend
- Verify environment variables are correct
- Check backend service is running

### File Upload Issues
- Ensure backend accepts multipart/form-data
- Check file size limits
- Verify upload endpoint is working

## Post-Deployment

1. Test form submission
2. Verify file uploads work
3. Check candidates list loads correctly
4. Test pagination and filtering
5. Ensure responsive design works

## Support

The frontend is now configured to work with your Railway-deployed backend. Make sure to:
1. Update the VITE_API_BASE_URL with your actual backend URL
2. Test the complete flow from form submission to data storage
3. Monitor for any CORS or API connectivity issues 