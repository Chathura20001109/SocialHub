// services/notificationService.js
const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(data) {
    const { recipient, sender, type, post, comment, message } = data;

    try {
      // Don't create notification if recipient is sender
      if (recipient.toString() === sender.toString()) {
        return null;
      }

      const notification = await Notification.create({
        recipient,
        sender,
        type,
        post: post || null,
        comment: comment || null,
        message
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username profileImage')
      .populate('post', 'content')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    return { notifications, total, unreadCount };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    return { 
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    };
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.deleteOne();
    return { message: 'Notification deleted successfully' };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    return count;
  }
}

module.exports = new NotificationService();

// ============================================================

