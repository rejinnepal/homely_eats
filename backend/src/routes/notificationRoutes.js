const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get user's notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Get unread notification count
router.get('/unread/count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });
    res.json(count);
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count', error: error.message });
  }
});

// Mark a notification as read
router.put('/:notificationId/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

// Mark all notifications as read
router.put('/read/all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
});

// Delete a notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const { recipient, type, title, message, data } = req.body;
    
    // If recipient is not provided, use the current user's ID
    const recipientId = recipient || req.user._id;
    
    const notification = new Notification({
      recipient: recipientId,
      type,
      title: title || getDefaultTitle(type),
      message,
      data
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
});

// Helper function to get default title based on notification type
function getDefaultTitle(type) {
  switch (type) {
    case 'booking_request':
      return 'New Booking Request';
    case 'booking_confirmed':
      return 'Booking Confirmed';
    case 'booking_cancelled':
      return 'Booking Cancelled';
    case 'booking_rejected':
      return 'Booking Rejected';
    case 'review':
      return 'New Review';
    case 'system':
      return 'System Notification';
    default:
      return 'Notification';
  }
}

module.exports = router; 