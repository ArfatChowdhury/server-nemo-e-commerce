# Railway Deployment Configuration

## Environment Variables Required

Add these to your Railway project settings:

```env
MONGODB_URI=mongodb+srv://nemo-admin:fOJI6IhhoHDkds1Q@cluster0.ruswoxv.mongodb.net/nemo-ecommerce-db?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
```

## Deployment Steps

### 1. Connect GitHub Repository
- Go to railway.app
- Click "New Project"
- Select "Deploy from GitHub"
- Connect your repository

### 2. Configure Environment Variables
- In Railway dashboard, go to "Variables"
- Add the environment variables above
- Make sure `MONGODB_URI` is set correctly

### 3. Deploy
- Railway will automatically detect Node.js project
- It will run `npm install` and `npm start`
- Your server should be running!

## Important Notes

- The PORT variable is automatically set by Railway
- No manual file upload storage needed (uploads folder works fine)
- For production image storage, consider using AWS S3 or similar

## Testing Deployment

1. After deployment, Railway will give you a public URL
2. Visit the base URL to confirm server is running
3. Test the API endpoint: `GET /products`
4. The server should respond with a status message

## Logs

- View logs in Railway dashboard
- Look for "✅ MongoDB connected successfully!"
- Confirm the port number matches Railway's provided port
