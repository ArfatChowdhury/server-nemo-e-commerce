# Quick Start Guide - Image Upload Setup

## 🎯 What You Need to Do

### Step 1: Verify Multer Installation
```powershell
npm install
```

### Step 2: Start Your Server
```powershell
npm start
```

You should see:
```
Nemo E-commerce Server is running on port: 5000
Pinged your deployment. You successfully connected to MongoDB!
```

### Step 3: Test with Postman
1. Open Postman
2. Create a **POST** request to: `http://localhost:5000/products`
3. Go to **Body** tab → Select **form-data**
4. Add these fields:

| Key | Type | Value |
|-----|------|-------|
| `images` | File | Select an image file |
| `images` | File | Select another image file (optional) |
| `productData` | Text | `{"name":"Test Product","price":99.99,"description":"A test product","category":"Test"}` |

5. Click **Send**

Expected response:
```json
{
  "success": true,
  "message": "Product uploaded successfully",
  "product": {
    "name": "Test Product",
    "price": 99.99,
    "description": "A test product",
    "category": "Test",
    "images": [
      "http://localhost:5000/uploads/1699999999999-123456789.jpg"
    ],
    "createdAt": "2024-11-14T10:30:00.000Z"
  }
}
```

### Step 4: Update React Native App

In your product creation screen, replace your current code with FormData approach:

```javascript
const createProduct = async (productInfo, selectedImages) => {
  const formData = new FormData();

  // Add images
  selectedImages.forEach((imageUri, index) => {
    formData.append('images', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `product-image-${index}.jpg`
    });
  });

  // Add product data
  formData.append('productData', JSON.stringify({
    name: productInfo.name,
    price: parseFloat(productInfo.price),
    description: productInfo.description,
    category: productInfo.category
  }));

  try {
    const response = await fetch('http://YOUR_SERVER_IP:5000/products', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Product created!');
      console.log('Image URLs:', result.product.images);
      // Navigate back or show success message
    } else {
      console.error('Upload failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Step 5: Verify Images Are Accessible

After uploading, you should be able to access images at:
- `http://localhost:5000/uploads/1699999999999-123456789.jpg` (if testing locally)
- `http://YOUR_SERVER_IP:5000/uploads/filename.jpg` (from other devices)

Try opening the URL in your browser - the image should display.

## 📋 Checklist

- [ ] Run `npm install`
- [ ] Start server with `npm start`
- [ ] Test with Postman (optional but recommended)
- [ ] Update React Native app with FormData approach
- [ ] Use returned image URLs instead of local paths
- [ ] Test end-to-end: Upload → View in DB → Display in app

## 🐛 Troubleshooting

### Issue: "Only image files are allowed"
**Solution:** Make sure you're uploading actual image files (JPG, PNG, GIF, WebP). Check file MIME type.

### Issue: "File too large"
**Solution:** Images must be under 10MB. Compress images or increase limit in `index.js` (line 34).

### Issue: Images not accessible from other devices
**Solution:** Use your server's IP address instead of `localhost`:
- Find your server IP: `ipconfig` in PowerShell
- Example: `http://192.168.1.100:5000/uploads/filename.jpg`

### Issue: "Cannot POST /products"
**Solution:** 
1. Make sure server is running
2. Make sure multer is installed: `npm install multer`
3. Check for any console errors

### Issue: FormData sending as empty
**Solution:** In React Native, make sure you're using the correct field names:
- `images` for files
- `productData` for JSON string

## 📚 Documentation

- **IMAGE_UPLOAD_GUIDE.md** - Detailed API documentation
- **REACT_NATIVE_CLIENT_EXAMPLE.js** - Complete code examples
- **IMPLEMENTATION_SUMMARY.md** - Overview of changes

## 🎓 Key Concepts

1. **FormData** - Special format for sending files with other data
2. **Multipart Upload** - Sending multiple types of data (files + JSON)
3. **Static Files** - Serving uploaded images via `/uploads` route
4. **URLs vs Paths** - Storing web URLs in DB instead of device paths
5. **Unique Filenames** - Preventing file collisions with timestamps

## ✨ Now You Can

✅ Upload multiple images per product  
✅ Store images on the server  
✅ Access images from any device  
✅ Share product URLs with others  
✅ Avoid local file path issues  

