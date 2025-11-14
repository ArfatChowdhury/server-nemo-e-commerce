// uploadConfig.js
// Centralized configuration for image uploads

const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Function to generate web-accessible URLs for uploaded files
const generateImageUrls = (req, files) => {
  const imageUrls = [];
  if (files && files.length > 0) {
    files.forEach(file => {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      imageUrls.push(imageUrl);
    });
  }
  return imageUrls;
};

module.exports = {
  upload,
  uploadDir,
  generateImageUrls
};
