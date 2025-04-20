const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_request', 
      'booking_confirmed', 
      'booking_cancelled', 
      'booking_rejected', 
      'dinner_cancelled',
      'dinner_deleted',
      'review', 
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// Static method to create a notification
notificationSchema.statics.createNotification = async function(data) {
  return this.create(data);
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 