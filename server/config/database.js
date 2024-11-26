require('dotenv').config();
const mongoose = require('mongoose');

if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

mongoose.connection.on('error', err => {
    console.error('MongoDB error:', err);
});

module.exports = mongoose; 