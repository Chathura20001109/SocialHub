// controllers/userController.js
const userService = require('../services/userService');
const { STATUS_CODES } = require('../utils/constants');
const { createResponse, getPaginationMeta } = require('../utils/helpers');

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Public
 */
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);

    // Check follow status if requester is authenticated
    let isFollowing = false;
    if (req.user && req.user._id.toString() !== userId) {
      isFollowing = await userService.checkFollowStatus(req.user._id, userId);
    }

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'User retrieved successfully', {
        user,
        isFollowing
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/username/:username
 * @desc    Get user by username
 * @access  Public
 */
const getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);

    // Check follow status if requester is authenticated
    let isFollowing = false;
    if (req.user && req.user._id.toString() !== user._id.toString()) {
      isFollowing = await userService.checkFollowStatus(req.user._id, user._id);
    }

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'User retrieved successfully', {
        user,
        isFollowing
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { bio, profileImage, coverImage } = req.body;
    const user = await userService.updateProfile(req.user._id, { bio, profileImage, coverImage });

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Profile updated successfully', { user })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/search
 * @desc    Search users by username or email
 * @access  Private
 */
const searchUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        createResponse(false, 'Search query is required')
      );
    }

    const { users, total } = await userService.searchUsers(
      q.trim(),
      req.user._id,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Users retrieved successfully', {
        users,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:userId/posts
 * @desc    Get user's posts
 * @access  Public
 */
const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const { posts, total } = await userService.getUserPosts(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Posts retrieved successfully', {
        posts,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:userId/followers
 * @desc    Get user's followers
 * @access  Public
 */
const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { followers, total } = await userService.getFollowers(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Followers retrieved successfully', {
        followers,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:userId/following
 * @desc    Get users that the user is following
 * @access  Public
 */
const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { following, total } = await userService.getFollowing(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Following retrieved successfully', {
        following,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserById,
  getUserByUsername,
  updateProfile,
  searchUsers,
  getUserPosts,
  getFollowers,
  getFollowing
};