const { connectDB } = require('../../config/database');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to DB and get status
    const dbConnection = await connectDB();
    console.log('Database connection attempt:', dbConnection);

    if (dbConnection.status === 'error') {
      return res.status(500).json({ 
        message: 'Database connection failed', 
        error: dbConnection.message 
      });
    }
    
    const { email, password, username } = req.body;
    
    // Log the request data (for debugging)
    console.log('Signup request received:', { email, username });
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    // Create user (password hashing is handled by the model)
    const user = new User({ email, password, username });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      dbStatus: dbConnection.status,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 