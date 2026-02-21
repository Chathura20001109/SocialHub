// routes/postRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getFeed,
  getGlobalFeed,
  getTrendingPosts
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { postLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Post validation
const postValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 1000 })
    .withMessage('Post cannot exceed 1000 characters'),

  body('image')
    .optional()
    .trim()
];

// Public/optional auth routes
router.get('/feed/global', optionalAuth, getGlobalFeed);
router.get('/feed/trending', optionalAuth, getTrendingPosts);
router.get('/:postId', optionalAuth, getPostById);

// Protected routes
router.post('/', protect, postLimiter, postValidation, validate, createPost);
router.put('/:postId', protect, postValidation, validate, updatePost);
router.delete('/:postId', protect, deletePost);
router.get('/feed/personal', protect, getFeed);

module.exports = router;

// ============================================================
