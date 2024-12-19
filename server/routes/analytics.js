const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/', auth, AnalyticsController.getAnalytics);

module.exports = router; 