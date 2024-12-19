const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post');
const { asyncHandler } = require('../utils/errorHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || 'uploads';
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

// Route to post video to all connected accounts
router.post('/', upload.single('video'), asyncHandler(async (req, res) => {
  await PostController.handlePost(req, res);
}));

// Route to get posting history
router.get('/history', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const accounts = await Account.find({
    lastPost: { $exists: true }
  })
  .sort({ lastPost: -1 })
  .skip((page - 1) * limit)
  .limit(parseInt(limit));

  const total = await Account.countDocuments({ lastPost: { $exists: true } });

  res.json({
    success: true,
    history: accounts,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(total / limit)
    }
  });
}));

module.exports = router; 