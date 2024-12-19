const express = require('express');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan');
require('dotenv').config();
require('./config/database');
const path = require('path');

const app = express();

app.use(morgan('dev'));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://post-on-multi-platform-webiste.vercel.app'
        : 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tiktok', require('./routes/tiktok'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/post', require('./routes/post'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

module.exports = app;