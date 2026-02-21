// routes/commentRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  addComment,
  getPostComments,
  getCommentReplies,
  deleteComment
} = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

const router = express.Router();

// Comment validation
const commentValidation = [
  body('postId')
    .notEmpty()
    .withMessage('Post ID is required')
    .isMongoId()
    .withMessage('Invalid post ID'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

// Public routes
router.get('/post/:postId', optionalAuth, getPostComments);
router.get('/:commentId/replies', optionalAuth, getCommentReplies);

// Protected routes
router.post('/', protect, commentValidation, validate, addComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;

// ============================================================
