const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB with more detailed logging
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    console.error('Error details:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      console.error('This might be due to network issues or incorrect connection string');
    }
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dinners', require('./routes/dinners'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/hosts', require('./routes/hosts'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/users'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Use port 5002 directly instead of from environment variable
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 