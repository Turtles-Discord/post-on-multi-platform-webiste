const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./api');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Use combined API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

module.exports = app; 