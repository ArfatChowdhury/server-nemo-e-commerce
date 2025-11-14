// index.js - ALTERNATIVE: Refactored Version Using uploadConfig.js
// ================================================================
// This is an OPTIONAL refactored version that uses the uploadConfig.js module
// Use this if you prefer cleaner, more modular code

/*
const express = require('express');
const cors = require('cors');
const { upload, uploadDir, generateImageUrls } = require('./uploadConfig');
const path = require('path');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config();

const uri = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());
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
    await client.connect();

    const usersCollection = client.db('nemo-ecommerce-db').collection('products');

    // GET all products
    app.get('/products', async (req, res) => {
      try {
        const cursor = await usersCollection.find().toArray();
        res.send(cursor);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // POST new product with images
    app.post('/products', upload.array('images', 10), async (req, res) => {
      try {
        const productData = JSON.parse(req.body.productData);
        const imageUrls = generateImageUrls(req, req.files);

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
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (error) {
    console.error('Connection error:', error);
  }
}

run().catch(console.dir);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Nemo E-commerce Server is running');
});

app.listen(port, () => {
  console.log(`Nemo E-commerce Server is running on port: ${port}`);
});
*/


// ============================================================================
// INSTRUCTIONS FOR USING THE REFACTORED VERSION:
// ============================================================================
//
// 1. The current index.js works perfectly as-is (recommended for simplicity)
//
// 2. If you want to use the refactored version above:
//    - Replace the contents of index.js with the code above (uncomment it)
//    - Make sure uploadConfig.js is in the same directory
//    - This version is cleaner and more maintainable for larger projects
//
// 3. Benefits of the refactored version:
//    - Multer configuration is isolated in uploadConfig.js
//    - Easier to reuse upload config in other files
//    - Cleaner separation of concerns
//    - Easier to test and maintain
//
// 4. Benefits of the current version:
//    - All code in one file - simpler for small projects
//    - No need for additional imports
//    - Easier to understand the complete flow
//
// CHOOSE WHAT WORKS BEST FOR YOUR PROJECT!
// ============================================================================
