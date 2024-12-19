const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email or username already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      username
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

router.get('/tiktok', async (req, res) => {
  const { accountNumber } = req.query;
  const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;
  const REDIRECT_URI = process.env.NODE_ENV === 'development'
    ? `http://localhost:5000/api/auth/tiktok/callback`
    : `${process.env.API_URL}/auth/tiktok/callback`;

  const authUrl = `https://www.tiktok.com/auth/authorize?client_key=${TIKTOK_CLIENT_ID}&response_type=code&scope=user.info.basic,video.list,video.upload&redirect_uri=${REDIRECT_URI}&state=${accountNumber}`;
  
  res.redirect(authUrl);
});

router.get('/tiktok/callback', async (req, res) => {
  try {
    const { code, state: accountNumber } = req.query;
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_ID,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.data && tokenData.data.access_token) {
      // Save the token and account info to database
      // ... your database logic here ...

      res.send(`
        <script>
          window.opener.postMessage({
            type: 'AUTH_SUCCESS',
            platform: 'tiktok',
            accountNumber: ${accountNumber},
            username: '${tokenData.data.open_id}'
          }, '*');
          window.close();
        </script>
      `);
    } else {
      throw new Error('Failed to get access token');
    }
  } catch (error) {
    console.error('TikTok auth error:', error);
    res.status(500).send(`
      <script>
        alert('Authentication failed');
        window.close();
      </script>
    `);
  }
});

module.exports = router; 