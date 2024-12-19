const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const PostController = require('../controllers/postController');
const AnalyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// Auth routes
router.post('/auth/signup', AuthController.signup);
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', auth, AuthController.logout);

// Account routes
router.get('/accounts', auth, AuthController.getAccounts);
router.post('/accounts/connect/:platform', auth, AuthController.connectPlatform);
router.delete('/accounts/:platform/:id', auth, AuthController.disconnectPlatform);

// Post routes
router.post('/post/video', auth, PostController.postVideo);
router.get('/posts', auth, PostController.getPosts);

// Analytics routes
router.get('/analytics', auth, AnalyticsController.getAnalytics);

module.exports = router; 