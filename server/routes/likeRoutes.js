// routes/likeRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  toggleLike,
  getPostLikes,
  checkUserLiked,
  getUserLikedPosts
} = require('../controllers/likeController');
const { protect, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

const router = express.Router();

// Like validation
const likeValidation = [
  body('postId')
    .notEmpty()
    .withMessage('Post ID is required')
    .isMongoId()
    .withMessage('Invalid post ID')
];

// Public routes
router.get('/post/:postId', optionalAuth, getPostLikes);
router.get('/user/:userId', optionalAuth, getUserLikedPosts);

// Protected routes
router.post('/toggle', protect, likeValidation, validate, toggleLike);
router.get('/check/:postId', protect, checkUserLiked);

module.exports = router;

// ============================================================