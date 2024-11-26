const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');

// TikTok auth routes
router.get('/tiktok', AuthController.initiateTikTokAuth);
router.get('/tiktok/callback', AuthController.handleTikTokCallback);

// Get accounts route
router.get('/accounts', async (req, res) => {
    try {
        const accounts = await Account.find({});
        res.json({ success: true, accounts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 