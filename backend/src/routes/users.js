const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  try {
    console.log('Profile update request received:', {
      userId: req.user._id,
      updates: req.body,
      token: req.header('Authorization')
    });

    const allowedUpdates = ['name', 'phone', 'bio', 'location'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    console.log('Filtered updates:', updates);

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    Object.keys(updates).forEach(update => {
      user[update] = updates[update];
    });

    console.log('Saving user updates:', {
      userId: user._id,
      updates: updates
    });

    await user.save();
    console.log('User updated successfully');
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
});

// Upload profile image
router.post('/profile-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File upload details:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Store image data in MongoDB
    user.profileImageData = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    await user.save();
    console.log('User profile updated with new image data');

    // Return the image data as base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    res.json({ imageUrl: base64Image });
  } catch (error) {
    console.error('Error in profile image upload:', error);
    res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
});

// Get profile image
router.get('/profile-image/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.profileImageData) {
      return res.status(404).json({ message: 'Profile image not found' });
    }

    res.set('Content-Type', user.profileImageData.contentType);
    res.send(user.profileImageData.data);
  } catch (error) {
    console.error('Error retrieving profile image:', error);
    res.status(500).json({ message: 'Error retrieving profile image', error: error.message });
  }
});

// Get user by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Update user role
router.patch('/:userId/role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'host'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has the role
    if (!user.roles.includes(role)) {
      user.roles.push(role);
    }

    user.activeRole = role;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
});

// Delete user
router.delete('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router; 