const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not set. Please add it to your environment variables.');
  console.error('For Vercel: Go to Settings → Environment Variables and add MONGODB_URI');
}

// Middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri || '', {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const productsCollection = client.db('nemo-ecommerce-db').collection('products');

    // Get all products
    app.get('/products', async (req, res) => {
      try {
        const products = await productsCollection.find().toArray();
        res.send({
          success: true,
          data: products,
          count: products.length
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send({ 
          success: false, 
          message: 'Error fetching products',
          error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message 
        });
      }
    });

    // Create new product (without image upload for now)
    app.post('/products', async (req, res) => {
      try {
        const productData = req.body;

        const newProduct = {
          ...productData,
          createdAt: new Date(),
          // If images are sent as local paths, convert to placeholder or empty
          images: productData.images && productData.images.length > 0 
            ? productData.images.map(img => 
                img.startsWith('http') ? img : 'https://via.placeholder.com/150?text=No+Image'
              )
            : ['https://via.placeholder.com/150?text=No+Image']
        };

        console.log('Creating new product:', newProduct.productName);
        const result = await productsCollection.insertOne(newProduct);
        
        res.send({
          success: true,
          message: 'Product created successfully',
          data: {
            id: result.insertedId,
            ...newProduct
          }
        });
      } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send({
          success: false,
          message: 'Error creating product',
          error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
        });
      }
    });

    // Update product
    app.put('/products/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = req.body;

        const result = await productsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...updateData, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: 'Product not found'
          });
        }

        res.send({
          success: true,
          message: 'Product updated successfully'
        });
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send({
          success: false,
          message: 'Error updating product',
          error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
        });
      }
    });

    // Delete product
    app.delete('/products/:id', async (req, res) => {
      try {
        const { id } = req.params;

        const result = await productsCollection.deleteOne(
          { _id: new ObjectId(id) }
        );

        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: 'Product not found'
          });
        }

        res.send({
          success: true,
          message: 'Product deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send({
          success: false,
          message: 'Error deleting product',
          error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
        });
      }
    });

    // Health check for products collection
    app.get('/health', async (req, res) => {
      try {
        await client.db("admin").command({ ping: 1 });
        const productCount = await productsCollection.countDocuments();
        
        res.send({
          success: true,
          message: 'Server is healthy',
          database: 'Connected',
          products: productCount,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: 'Server health check failed',
          error: error.message
        });
      }
    });

    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    // Don't exit process in production, just log error
    if (process.env.NODE_ENV === 'production') {
      console.log('Continuing without MongoDB connection...');
    } else {
      process.exit(1);
    }
  }
}

run().catch(console.dir);

// Health check endpoint
app.get('/', (req, res) => {
  res.send({
    success: true,
    message: 'Nemo E-commerce Server is running',
    status: 'active',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).send({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    client.close();
    console.log('Process terminated');
  });
});

module.exports = app;