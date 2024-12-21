const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['instagram', 'tiktok']
  },
  username: {
    type: String,
    required: true
  },
  accountNumber: {
    type: Number,
    required: true
  },
  cookies: Object,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', accountSchema); 