const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();

const uri = process.env.MONGODB_URI;

// Configure multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded images as static files
app.use('/uploads', express.static(uploadDir));

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const usersCollection = client.db('nemo-ecommerce-db').collection('products');

    app.get('/products', async (req, res) => {
      try {
        const cursor = await usersCollection.find().toArray();
        res.send(cursor);
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send({ 
          success: false, 
          message: 'Error fetching products',
          error: error.message 
        });
      }
    });

    app.post('/products', upload.array('images', 10), async (req, res) => {
      try {
        const productData = JSON.parse(req.body.productData);

        // Generate web-accessible URLs for uploaded images
        const imageUrls = [];
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
            imageUrls.push(imageUrl);
          });
        }

        // Add image URLs to product data
        const newProduct = {
          ...productData,
          images: imageUrls,
          createdAt: new Date()
        };

        console.log('New Product:', newProduct);
        const result = await usersCollection.insertOne(newProduct);
        res.send({
          success: true,
          message: 'Product uploaded successfully',
          result: result,
          product: newProduct
        });
      } catch (error) {
        console.error('Error uploading product:', error);
        res.status(500).send({
          success: false,
          message: 'Error uploading product',
          error: error.message
        });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

run().catch(console.dir);

// Health check endpoint
app.get('/', (req, res) => {
  res.send({
    message: 'Nemo E-commerce Server is running',
    status: 'active',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

const server = app.listen(port, () => {
  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  🚀 Nemo E-commerce Server`);
  console.log(`║  📍 Running on port: ${port}`);
  console.log(`║  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`║  ⏰ Started at: ${new Date().toISOString()}`);
  console.log(`╚════════════════════════════════════════════════════════════╝\n`);
});