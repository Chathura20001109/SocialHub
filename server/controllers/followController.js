// controllers/followController.js
const followService = require('../services/followService');
const { STATUS_CODES } = require('../utils/constants');
const { createResponse } = require('../utils/helpers');

/**
 * @route   POST /api/follows/follow
 * @desc    Follow a user
 * @access  Private
 */
const followUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        createResponse(false, 'User ID is required')
      );
    }

    const result = await followService.followUser(req.user._id, userId);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/follows/unfollow
 * @desc    Unfollow a user
 * @access  Private
 */
const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        createResponse(false, 'User ID is required')
      );
    }

    const result = await followService.unfollowUser(req.user._id, userId);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/follows/toggle
 * @desc    Toggle follow (follow/unfollow)
 * @access  Private
 */
const toggleFollow = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        createResponse(false, 'User ID is required')
      );
    }

    const result = await followService.toggleFollow(req.user._id, userId);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, result.message, { 
        action: result.action,
        isFollowing: result.isFollowing
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/follows/check/:userId
 * @desc    Check if current user follows another user
 * @access  Private
 */
const checkFollowStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const isFollowing = await followService.checkFollowStatus(req.user._id, userId);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Follow status retrieved', { isFollowing })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/follows/mutual/:userId
 * @desc    Get mutual followers with another user
 * @access  Private
 */
const getMutualFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const mutualUsers = await followService.getMutualFollowers(req.user._id, userId);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Mutual followers retrieved', { 
        users: mutualUsers,
        count: mutualUsers.length
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/follows/suggestions
 * @desc    Get follow suggestions
 * @access  Private
 */
const getSuggestions = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const suggestions = await followService.getSuggestions(req.user._id, parseInt(limit));

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Suggestions retrieved', { users: suggestions })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  toggleFollow,
  checkFollowStatus,
  getMutualFollowers,
  getSuggestions
};