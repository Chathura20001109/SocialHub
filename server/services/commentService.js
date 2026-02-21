// services/commentService.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const notificationService = require('./notificationService');

class CommentService {
  /**
   * Add comment to a post
   */
  async addComment(userId, postId, content, parentCommentId = null) {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // If parent comment ID provided, verify it exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }
      if (parentComment.post.toString() !== postId) {
        throw new Error('Parent comment does not belong to this post');
      }
    }

    // Create comment
    const comment = await Comment.create({
      post: postId,
      author: userId,
      content: content.trim(),
      parentComment: parentCommentId
    });

    // Increment post's comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    // If this is a reply, increment parent comment's reply count
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, { $inc: { replyCount: 1 } });
    }

    // Populate author details
    await comment.populate('author', 'username profileImage');

    // Create notification for post author (if not commenting on own post)
    if (post.author.toString() !== userId.toString()) {
      await notificationService.createNotification({
        recipient: post.author,
        sender: userId,
        type: 'comment',
        post: postId,
        comment: comment._id,
        message: 'commented on your post'
      });
    }

    return comment;
  }

  /**
   * Get comments for a post
   */
  async getPostComments(postId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Get top-level comments only (parentComment is null)
    const comments = await Comment.find({ 
      post: postId, 
      parentComment: null 
    })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Comment.countDocuments({ 
      post: postId, 
      parentComment: null 
    });

    return { comments, total };
  }

  /**
   * Get replies to a comment
   */
  async getCommentReplies(commentId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const replies = await Comment.find({ parentComment: commentId })
      .populate('author', 'username profileImage')
      .sort({ createdAt: 1 }) // Chronological order for replies
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Comment.countDocuments({ parentComment: commentId });

    return { replies, total };
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if user is the author
    if (comment.author.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this comment');
    }

    // Delete comment
    await comment.deleteOne();

    // Decrement post's comment count
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    // If this is a reply, decrement parent comment's reply count
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(
        comment.parentComment, 
        { $inc: { replyCount: -1 } }
      );
    }

    // Delete all replies to this comment
    const replies = await Comment.find({ parentComment: commentId });
    const replyCount = replies.length;
    
    if (replyCount > 0) {
      await Comment.deleteMany({ parentComment: commentId });
      // Adjust post comment count for deleted replies
      await Post.findByIdAndUpdate(
        comment.post, 
        { $inc: { commentCount: -replyCount } }
      );
    }

    return { message: 'Comment deleted successfully' };
  }
}

module.exports = new CommentService();

// ============================================================

