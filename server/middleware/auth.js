// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware function to check for a valid token
module.exports = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.headers['authorization'];

    // If no token is provided, return a 403 Forbidden response
    if (!token) {
        return res.status(403).json({ success: false, message: 'No token provided.' });
    }

    // Verify the token using the secret key
    jwt.verify(token, process.env.SESSION_SECRET, (err, decoded) => {
        // If token verification fails, return a 500 Internal Server Error response
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to authenticate token.' });
        }
        // If token is valid, save the decoded user information to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    });
};