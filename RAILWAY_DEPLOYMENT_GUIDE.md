# 🚀 Railway.app Deployment Guide

## Complete Step-by-Step Deployment

### Prerequisites
- GitHub account with repository
- Railway.app account
- MongoDB connection string (you already have this)

---

## Step 1: Prepare Your Repository

### Make sure these files are in your repo:
```
✅ index.js (updated for production)
✅ package.json (updated with Node.js version)
✅ .gitignore (includes /uploads)
✅ .env.production (template for env vars)
✅ README.md (already included)
```

### Commit your changes:
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

---

## Step 2: Create Railway Project

1. **Go to railway.app**
   - Sign in or create account
   - Click "New Project"

2. **Select "Deploy from GitHub"**
   - Click the GitHub icon
   - Authorize Railway to access your GitHub

3. **Select Your Repository**
   - Find "server-nemo-e-commerce"
   - Click to select it
   - Railway will auto-detect it's a Node.js project

---

## Step 3: Configure Environment Variables

In Railway Dashboard:

1. **Go to your project**
2. **Click "Variables" tab**
3. **Add these variables:**

| Key | Value | Note |
|-----|-------|------|
| `NODE_ENV` | `production` | Required |
| `MONGODB_URI` | `mongodb+srv://...` | Your connection string |

### Where to find MONGODB_URI:
- It's in your `.env` file or MongoDB Atlas
- Format: `mongodb+srv://username:password@cluster.mongodb.net/database`

---

## Step 4: Deploy

1. **Click "Deploy" button** in Railway dashboard
2. **Wait for build to complete**
   - You'll see build logs
   - Should take 2-3 minutes
   - Look for "✅ MongoDB connected successfully!"

3. **Verify Deployment**
   - Railway will show your public URL
   - It looks like: `https://server-nemo-ecommerce-xyz.railway.app`

---

## Step 5: Test Your Deployment

### Test Health Check
```bash
curl https://your-railway-url/
```

Expected response:
```json
{
  "message": "Nemo E-commerce Server is running",
  "status": "active",
  "version": "1.0.0"
}
```

### Test Get Products
```bash
curl https://your-railway-url/products
```

### Test Image Upload (with Postman)
1. **POST** to `https://your-railway-url/products`
2. **Body:** form-data with:
   - `images` (file) - Your image
   - `productData` (text) - `{"name":"Test","price":99.99}`

---

## Step 6: Update React Native App

Change the API URL in your React Native app from:
```javascript
'http://localhost:5000/products'
```

To:
```javascript
'https://your-railway-url/products'
```

Or use an environment variable:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
fetch(`${API_URL}/products`, {
  method: 'POST',
  body: formData
});
```

---

## Important Notes for Production

### File Uploads
- ✅ Images are stored in `/uploads` folder
- ⚠️ Files are ephemeral on Railway (lost on redeploy)
- 🎯 For production: Use AWS S3 or similar

### Environment Variables
- Don't commit `.env` to git
- Always use Railway dashboard for sensitive data
- `.env` file is already in `.gitignore`

### Monitoring
- Check Railway logs if deployment fails
- Look for "✅ MongoDB connected successfully!"
- If not connecting, verify MONGODB_URI is correct

### Performance
- First request takes longer (cold start)
- Subsequent requests are fast
- MongoDB connection is pooled

---

## Troubleshooting

### "Build failed" error
**Check:**
- [ ] Node version is 18.x
- [ ] All dependencies in package.json
- [ ] No syntax errors in index.js
- [ ] Logs for specific error message

### "MongoDB connection failed"
**Check:**
- [ ] MONGODB_URI is set in Variables
- [ ] Connection string is correct
- [ ] MongoDB Atlas allows connection from Railway IP

### "Port not binding"
**Check:**
- [ ] PORT env var is being used (it is in index.js)
- [ ] No hardcoded port number

### "Cannot find module 'multer'"
**Check:**
- [ ] Run `npm install` before pushing
- [ ] All dependencies in package.json
- [ ] Clear Railway build cache

---

## View Deployment Logs

1. **In Railway Dashboard:**
   - Click your project
   - Go to "Deployments" tab
   - Click active deployment
   - View logs in real-time

2. **What to look for:**
   ```
   ✅ Successfully installed dependencies
   ✅ Build completed
   ✅ Server started on PORT
   ✅ MongoDB connected successfully!
   ```

---

## Redeploy

To redeploy after making changes:

1. **Make changes locally**
2. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```
3. **Railway will auto-redeploy**
   - Watch the build in Railway dashboard
   - You can see it in "Deployments" tab

---

## Your Public URL

After deployment, your URL will be something like:
```
https://server-nemo-e-commerce-XXXXX.railway.app
```

Use this in:
- React Native app API calls
- Testing tools (Postman, cURL)
- Documentation

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Create Railway project from GitHub
3. ✅ Set environment variables
4. ✅ Deploy
5. ✅ Test endpoints
6. ✅ Update React Native app with new URL

---

## Quick Reference

| Task | Command/Action |
|------|----------------|
| **Deploy** | Push to GitHub, Railway auto-deploys |
| **View Logs** | Click project → Deployments → View Logs |
| **Set Variables** | Project → Variables tab |
| **Get Public URL** | Deployments tab or Settings |
| **Redeploy** | Push new commit to GitHub |
| **Test API** | Use Postman or cURL with public URL |

---

## Support

If you encounter issues:
1. Check Railway logs first
2. Verify environment variables are set
3. Check MongoDB connection string
4. Review index.js for any hardcoded values
5. Check .gitignore - no .env should be committed

---

**Your server is ready for Railway! 🚀**

Deployment should take less than 5 minutes.

