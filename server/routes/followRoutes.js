// routes/followRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  followUser,
  unfollowUser,
  toggleFollow,
  checkFollowStatus,
  getMutualFollowers,
  getSuggestions
} = require('../controllers/followController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

const router = express.Router();

// Follow validation
const followValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID')
];

// All routes are protected
router.post('/follow', protect, followValidation, validate, followUser);
router.post('/unfollow', protect, followValidation, validate, unfollowUser);
router.post('/toggle', protect, followValidation, validate, toggleFollow);
router.get('/check/:userId', protect, checkFollowStatus);
router.get('/mutual/:userId', protect, getMutualFollowers);
router.get('/suggestions', protect, getSuggestions);

module.exports = router;

// ============================================================