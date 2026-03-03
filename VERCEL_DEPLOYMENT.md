# Vercel Deployment Guide for EvolvEd

This document provides instructions for deploying the EvolvEd platform to Vercel.

## Architecture

- **Frontend**: React 18 + Vite SPA (served as static files)
- **Backend**: Express.js API (deployed as a single serverless function)
- **Database**: PostgreSQL (Supabase-hosted)

## Required Environment Variables

Configure these in your Vercel project settings:

### Database
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Application Settings
```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.vercel.app
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-minimum-32-characters
```

### OAuth (Optional - for Google/GitHub login)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
OAUTH_REDIRECT_URI=https://your-domain.vercel.app/oauth/callback
```

### Email (Optional - for notifications)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=EvolvEd <your-email@gmail.com>
```

### File Upload (Optional - if using Cloudinary/S3)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_AUTH_MAX=20
```

### OpenAI (for AI features)
```
OPENAI_API_KEY=sk-...your-openai-api-key
```

### Vercel-Specific (Auto-provided)
These are automatically provided by Vercel:
```
VERCEL_URL=your-deployment-url.vercel.app
VERCEL_PROJECT_PRODUCTION_URL=your-domain.vercel.app
```

## Deployment Steps

### 1. Connect to Vercel

```bash
npm install -g vercel
vercel login
vercel link
```

### 2. Set Environment Variables

Either through Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required variables from above

Or via CLI:
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add REFRESH_TOKEN_SECRET
# ... add all other variables
```

### 3. Deploy

```bash
vercel --prod
```

Or push to your connected GitHub repository - Vercel will auto-deploy.

## Build Process

The `vercel-build` script in `package.json` handles:
1. Frontend build (Vite → dist/)
2. Backend dependencies (npm install in backend/)
3. Prisma client generation

## API Routes

All backend API routes are accessible at:
```
https://your-domain.vercel.app/api/*
```

The `vercel.json` configuration rewrites all `/api/*` requests to the serverless function.

## Limitations (Vercel Free Tier)

- **Max function execution time**: 10 seconds
- **Memory**: 1024 MB
- **Cold starts**: First request after idle may be slow
- **Database connections**: Use connection pooling

## Troubleshooting

### Function Timeout
If operations take >10s, consider:
- Optimizing database queries
- Adding database indexes
- Upgrading to Vercel Pro (60s timeout)

### Database Connection Issues
- Use Supabase connection pooling URL
- Check DATABASE_URL format
- Verify Prisma binary targets in schema.prisma

### CORS Errors
- Verify FRONTEND_URL environment variable
- Check vercel.json rewrites configuration
- Ensure CORS middleware in backend/src/app.js accepts Vercel domains

### Cold Start Performance
- First request after idle may be slow (3-5s)
- Subsequent requests will be faster
- Consider using Vercel Pro for lower cold start times

## Post-Deployment

1. Test all API endpoints
2. Verify OAuth redirects (if using)
3. Test file uploads (if using)
4. Monitor Vercel logs for errors
5. Set up custom domain (optional)

## Support

For issues related to:
- **Deployment**: Check Vercel logs
- **Database**: Check Supabase logs
- **Backend**: Check backend/src/ code
- **Frontend**: Check browser console

## Security Notes

- Never commit `.env` files
- Rotate JWT secrets regularly
- Use strong passwords for DATABASE_URL
- Enable 2FA on Vercel account
- Review Vercel security best practices
