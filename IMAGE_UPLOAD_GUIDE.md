# Image Upload Functionality Guide

## Overview
This guide explains how to use the new image upload functionality in your Nemo E-commerce server.

## Backend Features Implemented

### 1. **Multiple Image Upload Support**
- Handles up to 10 images per product request
- Uses `multer` middleware for file handling

### 2. **Image Storage**
- Images are saved to the `uploads/` folder on the server
- Unique filenames are generated using timestamps to prevent collisions
- Only image files are allowed (JPEG, PNG, GIF, WebP)

### 3. **File Size Validation**
- Maximum file size: 10MB per image
- Images are validated by MIME type

### 4. **Web-Accessible URLs**
- Images are served via the `/uploads` route
- Full URLs are automatically generated in the format: `http://your-server:port/uploads/filename.ext`
- URLs are stored in MongoDB instead of local file paths

## How to Send Product Data with Images

### Using FormData (Recommended)

```javascript
// Example from your React Native app
const formData = new FormData();

// Add image files
if (images && images.length > 0) {
  images.forEach((imageUri, index) => {
    // Create a file object from the image URI
    formData.append('images', {
      uri: imageUri,
      type: 'image/jpeg', // or image/png, etc.
      name: `product-image-${index}.jpg`
    });
  });
}

// Add product data as JSON string
const productData = {
  name: 'Product Name',
  price: 99.99,
  description: 'Product description',
  category: 'Electronics',
  // Don't include local file paths - the server will handle URLs
};
formData.append('productData', JSON.stringify(productData));

// Send to server
try {
  const response = await fetch('http://your-server:5000/products', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - FormData will set it automatically with boundary
  });
  
  const result = await response.json();
  console.log('Product created successfully:', result);
  console.log('Image URLs:', result.product.images);
  
} catch (error) {
  console.error('Error uploading product:', error);
}
```

## Response Format

When successfully uploading a product with images, you'll receive:

```json
{
  "success": true,
  "message": "Product uploaded successfully",
  "result": {
    "insertedId": "507f1f77bcf86cd799439011"
  },
  "product": {
    "name": "Product Name",
    "price": 99.99,
    "description": "Product description",
    "category": "Electronics",
    "images": [
      "http://localhost:5000/uploads/1699999999999-123456789.jpg",
      "http://localhost:5000/uploads/1700000000000-987654321.png"
    ],
    "createdAt": "2024-11-14T10:30:00.000Z"
  }
}
```

## Error Handling

The server will return an error response if:

1. **Invalid file type**: Only images are allowed
   ```json
   {
     "success": false,
     "message": "Error uploading product",
     "error": "Only image files are allowed"
   }
   ```

2. **File too large**: Maximum 10MB per image
   ```json
   {
     "success": false,
     "message": "Error uploading product",
     "error": "File too large"
   }
   ```

3. **Missing product data**: `productData` field must be included
   ```json
   {
     "success": false,
     "message": "Error uploading product",
     "error": "Unexpected end of JSON input"
   }
   ```

## Database Schema

Products in MongoDB now include:

```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  description: String,
  category: String,
  images: Array<String>,  // Array of web-accessible URLs
  createdAt: Date
}
```

## Accessing Images

Once uploaded, images can be accessed directly via their URL:
- Browser: Simply open the URL in a browser
- React Native: Use the URL in an `<Image>` component
- API Clients: Include the URL in API responses

## File Organization

```
project-root/
├── index.js
├── package.json
├── .gitignore (includes /uploads)
├── uploads/               (created automatically)
│   ├── 1699999999999-123456789.jpg
│   ├── 1700000000000-987654321.png
│   └── ... (more uploaded images)
└── node_modules/
```

## Important Notes

1. **`uploads/` folder is excluded from git** - It's in `.gitignore`
2. **Unique filenames** - Prevents overwriting existing files
3. **MIME type validation** - Only actual image files are accepted
4. **Timestamp-based naming** - Ensures uniqueness across multiple uploads
5. **Dynamic URL generation** - Uses the request protocol and host to generate correct URLs

## Testing the Endpoint

### Using cURL (Command Line)

```bash
curl -X POST http://localhost:5000/products \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png" \
  -F "productData={\"name\":\"Test Product\",\"price\":99.99,\"description\":\"A test product\",\"category\":\"Test\"}"
```

### Using Postman

1. Create a new POST request to `http://localhost:5000/products`
2. Go to the "Body" tab and select "form-data"
3. Add fields:
   - `images` (File) - Select one or multiple image files
   - `images` (File) - Add additional images as needed
   - `productData` (Text) - Paste JSON string of product data
4. Send the request

## Updating the Endpoint in Your React Native App

Replace your current product submission code with the FormData approach shown above. This ensures:
- Images are uploaded as actual files (not local paths)
- Web URLs are returned and stored in the database
- Other devices can access the images via the server

