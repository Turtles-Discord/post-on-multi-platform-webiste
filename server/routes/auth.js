const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');

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

    // Create new user with plain password
    const user = new User({
      email,
      password, // Store password directly
      username
    });

    await user.save();

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

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route to get user's social media accounts
router.get('/accounts', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find accounts for this user
    const accounts = await Account.find({ userId: decoded.userId });
    
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'Error fetching accounts' });
  }
});

module.exports = router; 