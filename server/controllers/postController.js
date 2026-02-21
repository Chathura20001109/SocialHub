// controllers/postController.js
const postService = require('../services/postService');
const { STATUS_CODES } = require('../utils/constants');
const { createResponse, getPaginationMeta } = require('../utils/helpers');

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    const { content, image } = req.body;
    const post = await postService.createPost(req.user._id, { content, image });

    res.status(STATUS_CODES.CREATED).json(
      createResponse(true, 'Post created successfully', { post })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/:postId
 * @desc    Get post by ID
 * @access  Public
 */
const getPostById = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user ? req.user._id : null;
    
    const post = await postService.getPostById(postId, userId);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Post retrieved successfully', { post })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/posts/:postId
 * @desc    Update post
 * @access  Private
 */
const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, image } = req.body;

    const post = await postService.updatePost(postId, req.user._id, { content, image });

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Post updated successfully', { post })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/posts/:postId
 * @desc    Delete post
 * @access  Private
 */
const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const result = await postService.deletePost(postId, req.user._id);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/feed/personal
 * @desc    Get personalized feed (posts from followed users)
 * @access  Private
 */
const getFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const { posts, total } = await postService.getFeed(
      req.user._id,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Feed retrieved successfully', { 
        posts,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/feed/global
 * @desc    Get global feed (all posts)
 * @access  Public
 */
const getGlobalFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user ? req.user._id : null;

    const { posts, total } = await postService.getGlobalFeed(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Global feed retrieved successfully', { 
        posts,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/feed/trending
 * @desc    Get trending posts (most liked in last 24h)
 * @access  Public
 */
const getTrendingPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user ? req.user._id : null;

    const { posts, total } = await postService.getTrendingPosts(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Trending posts retrieved successfully', { 
        posts,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getFeed,
  getGlobalFeed,
  getTrendingPosts
};