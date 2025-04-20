const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Set connection timeout
mongoose.connection.on('connecting', () => {
  console.log('Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB successfully');
  process.exit(0);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
  process.exit(1);
});

// Connect with options
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
.then(() => {
  console.log('MongoDB connection established');
})
.catch(err => {
  console.error('Could not connect to MongoDB:', err);
  console.error('Error details:', err.message);
  if (err.name === 'MongoServerSelectionError') {
    console.error('This might be due to network issues or incorrect connection string');
  }
  process.exit(1);
}); 