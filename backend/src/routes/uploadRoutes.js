const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, admin, (req, res) => {
  console.log('Upload request received');
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('File uploaded:', req.file.filename);
    const filePath = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Image uploaded successfully',
      url: filePath
    });
  });
});

module.exports = router;
