const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Dinner = require('../models/Dinner');
const { auth, isHost } = require('../middleware/auth');

// Get all hosts
router.get('/', async (req, res) => {
  try {
    const hosts = await User.find({ role: 'host' })
      .select('-password');
    res.json(hosts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hosts', error: error.message });
  }
});

// Get host profile
router.get('/:id', async (req, res) => {
  try {
    const host = await User.findById(req.params.id)
      .select('-password');
    
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    
    // Get host's dinners
    const dinners = await Dinner.find({ host: host._id })
      .sort({ date: 1 });
    
    // Create a sanitized host profile that's safe to send to any user
    const sanitizedHost = {
      _id: host._id,
      name: host.name,
      email: host.email,
      phone: host.phone,
      bio: host.bio,
      location: host.location,
      specialties: host.specialties,
      languages: host.languages,
      dietaryRestrictions: host.dietaryRestrictions,
      isVerified: host.isVerified,
      rating: host.rating,
      totalReviews: host.totalReviews,
      profileImage: host.profileImage,
      role: host.role,
      createdAt: host.createdAt,
      updatedAt: host.updatedAt
    };
    
    res.json({
      host: sanitizedHost,
      dinners
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching host profile', error: error.message });
  }
});

// Update host profile
router.put('/:id', auth, isHost, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    const host = await User.findById(req.params.id);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }
    
    // Update fields
    const {
      name,
      email,
      phone,
      bio,
      location,
      specialties,
      languages,
      dietaryRestrictions,
      isVerified
    } = req.body;

    // Update basic info
    if (name) host.name = name;
    if (email) host.email = email;
    if (phone) host.phone = phone;
    if (bio) host.bio = bio;
    if (location) host.location = location;
    
    // Update arrays if provided
    if (specialties) host.specialties = specialties;
    if (languages) host.languages = languages;
    if (dietaryRestrictions) host.dietaryRestrictions = dietaryRestrictions;
    
    // Only admins can update verification status
    if (isVerified !== undefined && req.user.role === 'admin') {
      host.isVerified = isVerified;
    }
    
    await host.save();
    
    // Return updated host data
    const updatedHost = await User.findById(host._id)
      .select('-password')
      .lean();
    
    res.json(updatedHost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating host profile', error: error.message });
  }
});

module.exports = router; 