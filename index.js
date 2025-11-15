

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// Environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Please configure it in your environment.');
}

// Mongo client options
const clientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // useUnifiedTopology: true, // optional for older drivers
};

// Reuse client across lambda invocations (Vercel best practice)
let clientPromise;
if (!global._mongoClientPromise) {
  const client = new MongoClient(MONGODB_URI, clientOptions);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// Helper to get collection
async function getProductsCollection() {
  const client = await clientPromise;
  return client.db('nemo-ecommerce-db').collection('products');
}

// Root route (keeps same behavior)
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Nemo E-commerce Server', environment: NODE_ENV });
});

// GET /products
app.get('/products', async (req, res) => {
  try {
    const collection = await getProductsCollection();
    const products = await collection.find().toArray();
    res.json({ success: true, data: products, count: products.length });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Error fetching products', error: String(err) });
  }
});

// POST /products
app.post('/products', async (req, res) => {
  try {
    const product = req.body || {};
    const newProduct = { ...product, createdAt: new Date() };
    const collection = await getProductsCollection();
    const result = await collection.insertOne(newProduct);
    res.json({ success: true, insertedId: result.insertedId, data: newProduct });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, message: 'Error creating product', error: String(err) });
  }
});

// GET /health
app.get('/health', async (req, res) => {
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    const collection = await getProductsCollection();
    const count = await collection.countDocuments();
    res.json({ success: true, database: 'connected', products: count });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ success: false, message: 'DB ping failed', error: String(err) });
  }
});

// Export app so Vercel can use it as a single function
module.exports = app;

// If run locally, start express server (keeps local dev working)
if (require.main === module) {
  const port = process.env.PORT || 5000;
  clientPromise
    .then(() => {
      app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    });
}
