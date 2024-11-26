const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['tiktok', 'instagram']
  },
  accountNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  username: {
    type: String,
    required: true
  },
  cookies: {
    type: Array,
    required: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastPost: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'error'],
    default: 'active'
  },
  errorLog: [{
    date: {
      type: Date,
      default: Date.now
    },
    message: String
  }],
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  tokenExpiry: {
    type: Date
  },
  scope: {
    type: String
  },
  userId: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to ensure unique platform-accountNumber combinations
accountSchema.index({ platform: 1, accountNumber: 1 }, { unique: true });

// Method to check if cookies are still valid
accountSchema.methods.validateCookies = async function() { 
  // Implementation depends on platform

  return true;
};

// Method to update cookies
accountSchema.methods.updateCookies = async function(newCookies) {
  this.cookies = newCookies;
  this.lastLogin = new Date();
  await this.save();
};

module.exports = mongoose.model('Account', accountSchema); 