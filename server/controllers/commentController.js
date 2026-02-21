// controllers/commentController.js
const commentService = require('../services/commentService');
const { STATUS_CODES } = require('../utils/constants');
const { createResponse, getPaginationMeta } = require('../utils/helpers');

/**
 * @route   POST /api/comments
 * @desc    Add comment to a post
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { postId, content, parentCommentId } = req.body;

    const comment = await commentService.addComment(
      req.user._id,
      postId,
      content,
      parentCommentId || null
    );

    res.status(STATUS_CODES.CREATED).json(
      createResponse(true, 'Comment added successfully', { comment })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/comments/post/:postId
 * @desc    Get comments for a post
 * @access  Public
 */
const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const { comments, total } = await commentService.getPostComments(
      postId,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Comments retrieved successfully', { 
        comments,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/comments/:commentId/replies
 * @desc    Get replies to a comment
 * @access  Public
 */
const getCommentReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const { replies, total } = await commentService.getCommentReplies(
      commentId,
      parseInt(page),
      parseInt(limit)
    );

    const pagination = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, 'Replies retrieved successfully', { 
        replies,
        pagination
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/comments/:commentId
 * @desc    Delete comment
 * @access  Private
 */
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const result = await commentService.deleteComment(commentId, req.user._id);

    res.status(STATUS_CODES.OK).json(
      createResponse(true, result.message)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getPostComments,
  getCommentReplies,
  deleteComment
};