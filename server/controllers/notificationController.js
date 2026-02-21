// controllers/notificationController.js
const notificationService = require('../services/notificationService');
const { STATUS_CODES } = require('../utils/constants');
const { createResponse, getPaginationMeta } = require('../utils/helpers');

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const { notifications, total, unreadCount } = 
      await notificationService.getUserNotifications(
        req.user._id,
        parseInt(page),
        parseInt(limit)
      );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Notifications retrieved successfully', { 
        notifications,
        unreadCount,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(
      notificationId,
      req.user._id
    );

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Notification marked as read', { notification })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, result.message, { 
        modifiedCount: result.modifiedCount 
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const result = await notificationService.deleteNotification(
      notificationId,
      req.user._id
    );

    res.status(STATUS_CODES.OK).json(
      createResponse(true, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Unread count retrieved', { count })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};