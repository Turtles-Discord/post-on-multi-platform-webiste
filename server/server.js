const express = require('express');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan');
require('dotenv').config();
require('./config/database');
const path = require('path');

const app = express();

// Middleware
app.use(morgan(':date[iso] :remote-addr - :method :url :status :response-time ms - :user-agent'));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL 
        : 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Serve uploads
app.use('/uploads', express.static('uploads'));

// Serve static files from React app
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    // TikTok verification endpoint
    app.get('/tiktokOCUO6obTbCQ2k1ms6dPL14G7IKASZ4xo.txt', (req, res) => {
        res.type('text/plain');
        res.send('OCUO6obTbCQ2k1ms6dPL14G7IKASZ4xo'); // Replace with your actual verification code
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});