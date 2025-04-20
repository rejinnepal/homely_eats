const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { auth, isHost } = require('../middleware/auth');

// Get all reviews for a dinner
router.get('/dinner/:dinnerId', async (req, res) => {
  try {
    const reviews = await Review.find({ dinner: req.params.dinnerId })
      .populate('guest', 'name profileImage')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Get all reviews for a host
router.get('/host/:hostId', async (req, res) => {
  try {
    const reviews = await Review.find({ host: req.params.hostId })
      .populate('guest', 'name profileImage')
      .populate('dinner', 'title date')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching host reviews', error: error.message });
  }
});

// Create a review
router.post('/', auth, async (req, res) => {
  try {
    const { dinnerId, rating, comment, photos } = req.body;
    
    // Check if user has booked this dinner
    const booking = await Booking.findOne({
      dinner: dinnerId,
      guest: req.user._id,
      status: 'confirmed'
    });
    
    if (!booking) {
      return res.status(400).json({ message: 'You can only review dinners you have attended' });
    }
    
    // Check if user has already reviewed this dinner
    const existingReview = await Review.findOne({
      dinner: dinnerId,
      guest: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this dinner' });
    }
    
    // Create review
    const review = new Review({
      dinner: dinnerId,
      guest: req.user._id,
      host: booking.host,
      rating,
      comment,
      photos
    });
    
    await review.save();
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
});

// Update a review
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, comment, photos } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Only the guest who wrote the review can update it
    if (review.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (photos) review.photos = photos;
    
    await review.save();
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Only the guest who wrote the review can delete it
    if (review.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router; 