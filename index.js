const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

// Use MONGODB_URI from environment
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not set. Please configure it in your environment.');
}

app.use(cors());
app.use(express.json());

// Cached MongoDB client for serverless
let cachedClient = null;
let cachedDb = null;

async function getMongoClient() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  try {
    const client = new MongoClient(uri || '', {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await client.connect();
    cachedClient = client;
    cachedDb = client.db('nemo-ecommerce-db');
    console.log('✅ MongoDB connected');
    return { client: cachedClient, db: cachedDb };
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err;
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Nemo E-commerce Server',
    environment: process.env.NODE_ENV || 'production'
  });
});

// GET /products - return all products
app.get('/products', async (req, res) => {
  try {
    const { db } = await getMongoClient();
    const products = await db.collection('products').find().toArray();
    const data = products.map(p => ({ ...p, _id: p._id.toString() }));
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Error fetching products', error: String(err) });
  }
});

// POST /products - create a product
app.post('/products', async (req, res) => {
  try {
    const { db } = await getMongoClient();
    const product = req.body || {};
    const newProduct = { ...product, createdAt: new Date() };
    const result = await db.collection('products').insertOne(newProduct);
    res.status(201).json({ success: true, insertedId: result.insertedId.toString(), data: newProduct });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, message: 'Error creating product', error: String(err) });
  }
});

// GET /health - ping MongoDB
app.get('/health', async (req, res) => {
  try {
    const { client, db } = await getMongoClient();
    await client.db('admin').command({ ping: 1 });
    const count = await db.collection('products').countDocuments();
    res.json({ success: true, database: 'connected', products: count });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ success: false, message: 'Health check failed', error: String(err) });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Export app for Vercel serverless
module.exports = app;

// Optional: for local development with app.listen()
const port = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}