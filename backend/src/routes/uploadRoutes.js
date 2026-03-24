const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { protect, admin } = require('../middleware/auth');

const upload = multer({ storage });

router.post('/', protect, admin, (req, res) => {
  console.log('Upload request received');
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Cloudinary upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('File uploaded to Cloudinary:', req.file.path);
    res.json({
      message: 'Image uploaded to Cloudinary successfully',
      url: req.file.path // Cloudinary full HTTPS URL
    });
  });
});

module.exports = router;
