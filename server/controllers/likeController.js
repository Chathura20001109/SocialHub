// controllers/likeController.js
const likeService = require('../services/likeService');
const { STATUS_CODES } = require('../utils/constants');
const { createResponse, getPaginationMeta } = require('../utils/helpers');

/**
 * @route   POST /api/likes/toggle
 * @desc    Toggle like on a post
 * @access  Private
 */
const toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        createResponse(false, 'Post ID is required')
      );
    }

    const result = await likeService.toggleLike(req.user._id, postId);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, result.message, { 
        action: result.action,
        isLiked: result.isLiked
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/likes/post/:postId
 * @desc    Get users who liked a post
 * @access  Public
 */
const getPostLikes = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { users, total } = await likeService.getPostLikes(
      postId,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Likes retrieved successfully', { 
        users,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/likes/check/:postId
 * @desc    Check if current user liked a post
 * @access  Private
 */
const checkUserLiked = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const isLiked = await likeService.checkUserLiked(req.user._id, postId);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Like status retrieved', { isLiked })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/likes/user/:userId
 * @desc    Get posts liked by a user
 * @access  Public
 */
const getUserLikedPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const { posts, total } = await likeService.getUserLikedPosts(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Liked posts retrieved successfully', { 
        posts,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleLike,
  getPostLikes,
  checkUserLiked,
  getUserLikedPosts
};