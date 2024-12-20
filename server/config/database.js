require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log('MongoDB already connected');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully');
    
    return { status: 'connected', message: 'MongoDB connected successfully' };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return { status: 'error', message: error.message };
  }
};

module.exports = { connectDB }; 