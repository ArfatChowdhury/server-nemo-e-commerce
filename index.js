const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config();

const uri = process.env.MONGODB_URI;
// console.log('MongoDB URI:', uri)

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
    // Connect the client to the server	(optional starting in v4.7)

    await client.connect();

    const  usersCollection = client.db('nemo-ecommerce-db').collection('products')

    app.get('/products', async (req,res)=>{
        const cursor = await usersCollection.find().toArray();
        res.send(cursor);
    })

    app.post('/products', upload.array('images', 10), async (req, res)=> {
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
    })
   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Nemo E-commerce Server is running');
})

app.listen(port, () =>{
    console.log(`Nemo E-commerce Server is running on port: ${port}`);
});