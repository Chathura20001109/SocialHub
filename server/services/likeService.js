// services/likeService.js
const Like = require('../models/Like');
const Post = require('../models/Post');
const notificationService = require('./notificationService');

class LikeService {
  /**
   * Toggle like on a post (like if not liked, unlike if already liked)
   */
  async toggleLike(userId, postId) {
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Check if user already liked this post
    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      // Unlike: Remove like
      await existingLike.deleteOne();
      
      // Decrement post's like count
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });

      return { 
        action: 'unliked',
        message: 'Post unliked successfully',
        isLiked: false
      };
    } else {
      // Like: Create new like
      await Like.create({ post: postId, user: userId });
      
      // Increment post's like count
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });

      // Create notification for post author (if not liking own post)
      if (post.author.toString() !== userId.toString()) {
        await notificationService.createNotification({
          recipient: post.author,
          sender: userId,
          type: 'like',
          post: postId,
          message: 'liked your post'
        });
      }

      return { 
        action: 'liked',
        message: 'Post liked successfully',
        isLiked: true
      };
    }
  }

  /**
   * Get users who liked a post
   */
  async getPostLikes(postId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const likes = await Like.find({ post: postId })
      .populate('user', 'username profileImage bio')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Like.countDocuments({ post: postId });

    // Extract user objects
    const users = likes.map(like => like.user);

    return { users, total };
  }

  /**
   * Check if user liked a post
   */
  async checkUserLiked(userId, postId) {
    const like = await Like.findOne({ post: postId, user: userId });
    return !!like;
  }

  /**
   * Get posts liked by a user
   */
  async getUserLikedPosts(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const likes = await Like.find({ user: userId })
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'username profileImage'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Like.countDocuments({ user: userId });

    // Extract posts and add isLiked flag
    const posts = likes
      .filter(like => like.post) // Filter out likes for deleted posts
      .map(like => ({
        ...like.post.toObject(),
        isLiked: true
      }));

    return { posts, total };
  }
}

module.exports = new LikeService();

// ============================================================

