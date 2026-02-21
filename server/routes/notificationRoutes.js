
// routes/notificationRoutes.js
const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All notification routes are protected
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:notificationId/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:notificationId', protect, deleteNotification);

module.exports = router;