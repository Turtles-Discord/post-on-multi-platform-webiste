const express = require('express');
const router = express.Router();
const Account = require('../models/Account');

router.get('/tiktok', async (req, res) => {
  try {
    const accounts = await Account.find({ 
      platform: 'tiktok' 
    }).select('accountNumber username -_id');
    
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

module.exports = router; 