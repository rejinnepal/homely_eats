const express = require('express');
const app = express();
const path = require('path');
const dinnersRouter = require('./routes/dinners');
const bookingsRouter = require('./routes/bookings');
const reviewsRouter = require('./routes/reviews');
const hostsRouter = require('./routes/hosts');
const notificationsRouter = require('./routes/notifications');
const usersRouter = require('./routes/users');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, '../uploads');
console.log('Uploads static path:', uploadsPath);

// Add logging middleware for static file requests
app.use('/uploads', (req, res, next) => {
  console.log('Static file request:', {
    url: req.url,
    method: req.method,
    path: path.join(uploadsPath, req.url),
    exists: require('fs').existsSync(path.join(uploadsPath, req.url))
  });
  next();
}, express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'no-cache');
    console.log('Serving static file:', filePath);
  }
}));

// Routes
app.use('/api/dinners', dinnersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/hosts', hostsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/users', usersRouter);

module.exports = app; 