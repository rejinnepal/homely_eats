const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user._id;

      const result = await notificationService.getNotifications(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      res.json(result);
    } catch (error) {
      console.error('Error in getNotifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user._id;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user._id;

      const notification = await notificationService.markAsRead(notificationId, userId);
      res.json(notification);
    } catch (error) {
      console.error('Error in markAsRead:', error);
      if (error.message === 'Notification not found') {
        res.status(404).json({ error: 'Notification not found' });
      } else {
        res.status(500).json({ error: 'Failed to mark notification as read' });
      }
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user._id;
      const modifiedCount = await notificationService.markAllAsRead(userId);
      res.json({ message: `${modifiedCount} notifications marked as read` });
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user._id;

      await notificationService.deleteNotification(notificationId, userId);
      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      if (error.message === 'Notification not found') {
        res.status(404).json({ error: 'Notification not found' });
      } else {
        res.status(500).json({ error: 'Failed to delete notification' });
      }
    }
  }
}

module.exports = new NotificationController(); 