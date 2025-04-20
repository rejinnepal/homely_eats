const Notification = require('../models/Notification');

class NotificationService {
  async getNotifications(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: userId })
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({ 
      recipient: userId,
      read: false 
    });
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    await notification.save();
    return notification;
  }

  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
    return result.modifiedCount;
  }

  async deleteNotification(notificationId, userId) {
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (result.deletedCount === 0) {
      throw new Error('Notification not found');
    }
    
    return true;
  }

  async createNotification(recipientId, type, title, message, data = {}) {
    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      data
    });

    await notification.save();
    return notification;
  }
}

module.exports = new NotificationService(); 