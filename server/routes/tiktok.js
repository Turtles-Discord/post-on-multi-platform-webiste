const express = require('express');
const router = express.Router();
const multer = require('multer');
const TikTokController = require('../controllers/tiktok');
const auth = require('../middleware/auth');


// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Routes
router.post('/upload/file', auth, upload.single('video'), TikTokController.uploadVideoByFile);
router.post('/upload/url', auth, TikTokController.uploadVideoByUrl);
router.post('/publish', auth, TikTokController.directPost);
router.get('/test-permissions', auth, TikTokController.testVideoUpload);

module.exports = router; 