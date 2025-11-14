# 🚀 Railway Deployment Checklist

## Pre-Deployment (Do This First)

- [ ] Review all changes in RAILWAY_CHANGES.md
- [ ] Test locally: `npm install && npm start`
- [ ] Verify MongoDB connection works
- [ ] Check that server starts without errors
- [ ] Confirm `.env` is in `.gitignore`

## Git & GitHub

- [ ] `git status` - Check for uncommitted changes
- [ ] `git add .` - Stage all changes
- [ ] `git commit -m "Prepare for Railway deployment"` - Commit changes
- [ ] `git push origin main` - Push to GitHub
- [ ] Verify changes appear on GitHub

## Railway Setup

- [ ] Go to railway.app
- [ ] Sign in or create account
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub"
- [ ] Authorize Railway
- [ ] Select "server-nemo-e-commerce" repository
- [ ] Wait for project to be created

## Environment Variables

In Railway → Variables tab, add:

- [ ] `NODE_ENV` = `production`
- [ ] `MONGODB_URI` = `mongodb+srv://nemo-admin:fOJI6IhhoHDkds1Q@cluster0.ruswoxv.mongodb.net/nemo-ecommerce-db?retryWrites=true&w=majority`

⚠️ Make sure MongoDB URI is exactly correct!

## Deploy

- [ ] Click "Deploy" button in Railway
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Watch logs for "✅ MongoDB connected successfully!"
- [ ] Deployment should show as "active"

## Testing

After deployment:

- [ ] Note your public URL from Railway
- [ ] Test health endpoint: `curl https://your-url/`
- [ ] Should return JSON with status: "active"
- [ ] Test products: `curl https://your-url/products`
- [ ] Should return array from MongoDB (empty if no products)
- [ ] Test with Postman (create a test product)

## Update React Native App

- [ ] Replace `http://localhost:5000` with your Railway URL
- [ ] Example: `https://server-nemo-e-commerce-XXXXX.railway.app`
- [ ] Test upload a product with images
- [ ] Verify images upload and URLs work
- [ ] Check that products appear in MongoDB

## Monitoring

Regular checks:

- [ ] Check Railway logs occasionally
- [ ] Monitor for errors
- [ ] Verify MongoDB connection stays active
- [ ] Test API endpoints periodically

---

## What Should Happen

### After `git push`
- GitHub receives your code ✓

### During Railway Deployment
```
Building...
Installing dependencies...
✅ All dependencies installed
Running start script...
✅ MongoDB connected successfully!
Server running on PORT
Deployment complete!
```

### After Deployment
```
GET / → Returns JSON status
GET /products → Returns product array
POST /products → Uploads product with images
```

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Build fails | Check Railway logs for error |
| MongoDB error | Verify MONGODB_URI in Variables |
| Server not starting | Check NODE_ENV is set |
| Images not uploading | Check /uploads folder exists |
| 404 errors | Verify endpoints in code |

---

## Your Public URL

After deployment, you'll get:
```
https://server-nemo-e-commerce-XXXXX.railway.app
```

Use this in React Native app:
```javascript
const API_URL = 'https://server-nemo-e-commerce-XXXXX.railway.app';

// In your fetch calls:
fetch(`${API_URL}/products`, {
  method: 'POST',
  body: formData
});
```

---

## Important Notes

⚠️ **File Storage**
- Images in /uploads folder are temporary
- For production, use AWS S3 or similar cloud storage

✅ **Environment Variables**
- Never commit .env to git
- Always use Railway dashboard for secrets
- .env is in .gitignore (won't be uploaded)

📝 **Logs**
- View real-time logs in Railway dashboard
- Very helpful for debugging issues
- Look for error messages and connection status

🔄 **Redeploy**
- Push changes to GitHub
- Railway will auto-deploy
- No manual redeploy needed

---

## Quick Commands for Later

When you need to redeploy:
```bash
git add .
git commit -m "Update message"
git push origin main
# Railway auto-deploys!
```

To test your Railway URL:
```bash
curl https://your-railway-url/
curl https://your-railway-url/products
```

---

## Success Indicators

✅ Your server is ready for Railway when:
- package.json has Node.js version
- index.js uses process.env.PORT
- All dependencies are listed
- .env is in .gitignore
- No hardcoded passwords
- Error handling is in place
- Health check endpoint works

**All of these are done! ✅**

---

## Next Action: Deploy!

1. Review this checklist
2. Make sure git is ready
3. Go to railway.app
4. Create project from GitHub
5. Add environment variables
6. Click Deploy
7. Wait 2-3 minutes
8. Test your public URL

**You're ready! 🚀**

