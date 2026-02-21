// routes/userRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  getUserById,
  getUserByUsername,
  updateProfile,
  searchUsers,
  getUserPosts,
  getFollowers,
  getFollowing
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

const router = express.Router();

// Profile update validation
const updateProfileValidation = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio cannot exceed 200 characters'),

  body('profileImage')
    .optional()
    .trim(),

  body('coverImage')
    .optional()
    .trim()
];

// Public routes (with optional auth)
router.get('/search', protect, searchUsers);
router.get('/:userId', optionalAuth, getUserById);
router.get('/username/:username', optionalAuth, getUserByUsername);
router.get('/:userId/posts', optionalAuth, getUserPosts);
router.get('/:userId/followers', optionalAuth, getFollowers);
router.get('/:userId/following', optionalAuth, getFollowing);

// Protected routes
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);

module.exports = router;

// ============================================================






