// services/postService.js
const Post = require('../models/Post');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Like = require('../models/Like');
const mongoose = require('mongoose');

class PostService {
  /**
   * Create a new post
   */
  async createPost(userId, postData) {
    const { content, image } = postData;

    if (!content || content.trim().length === 0) {
      throw new Error('Post content is required');
    }

    // Create post
    const post = await Post.create({
      author: userId,
      content: content.trim(),
      image: image || null
    });

    // Increment user's post count
    await User.findByIdAndUpdate(userId, { $inc: { postCount: 1 } });

    // Populate author details
    await post.populate('author', 'username profileImage');

    return post;
  }

  /**
   * Get post by ID
   */
  async getPostById(postId, userId = null) {
    const post = await Post.findById(postId)
      .populate('author', 'username profileImage');

    if (!post) {
      throw new Error('Post not found');
    }

    // Check if current user liked this post
    let isLiked = false;
    if (userId) {
      const like = await Like.findOne({ post: postId, user: userId });
      isLiked = !!like;
    }

    return { ...post.toObject(), isLiked };
  }

  /**
   * Update post
   */
  async updatePost(postId, userId, updateData) {
    const { content, image } = updateData;

    const post = await Post.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      throw new Error('Not authorized to update this post');
    }

    // Update fields
    if (content) post.content = content.trim();
    if (image !== undefined) post.image = image;
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate('author', 'username profileImage');

    return post;
  }

  /**
   * Delete post
   */
  async deletePost(postId, userId) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this post');
    }

    await post.deleteOne();

    // Decrement user's post count
    await User.findByIdAndUpdate(userId, { $inc: { postCount: -1 } });

    // Delete associated likes and comments (cascade delete)
    await Like.deleteMany({ post: postId });
    // Note: Comments will be deleted in the next phase

    return { message: 'Post deleted successfully' };
  }

  /**
   * Get feed (posts from users that current user follows + own posts)
   */
  async getFeed(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Get users that current user follows
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following);
    
    // Include current user's posts too
    followingIds.push(userId);

    // Get posts from followed users
    const posts = await Post.find({ author: { $in: followingIds } })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Post.countDocuments({ author: { $in: followingIds } });

    // Check which posts the user has liked
    const postIds = posts.map(p => p._id);
    const likes = await Like.find({ 
      post: { $in: postIds }, 
      user: userId 
    }).select('post');
    
    const likedPostIds = new Set(likes.map(l => l.post.toString()));

    // Add isLiked flag to each post
    const postsWithLikes = posts.map(post => ({
      ...post,
      isLiked: likedPostIds.has(post._id.toString())
    }));

    return { posts: postsWithLikes, total };
  }

  /**
   * Get global feed (all posts from all users)
   */
  async getGlobalFeed(userId = null, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Post.countDocuments();

    // Check which posts the user has liked (if authenticated)
    let postsWithLikes = posts;
    if (userId) {
      const postIds = posts.map(p => p._id);
      const likes = await Like.find({ 
        post: { $in: postIds }, 
        user: userId 
      }).select('post');
      
      const likedPostIds = new Set(likes.map(l => l.post.toString()));

      postsWithLikes = posts.map(post => ({
        ...post,
        isLiked: likedPostIds.has(post._id.toString())
      }));
    }

    return { posts: postsWithLikes, total };
  }

  /**
   * Get trending posts (most liked in last 24 hours)
   */
  async getTrendingPosts(userId = null, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const posts = await Post.find({ createdAt: { $gte: oneDayAgo } })
      .populate('author', 'username profileImage')
      .sort({ likeCount: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Post.countDocuments({ createdAt: { $gte: oneDayAgo } });

    // Check which posts the user has liked (if authenticated)
    let postsWithLikes = posts;
    if (userId) {
      const postIds = posts.map(p => p._id);
      const likes = await Like.find({ 
        post: { $in: postIds }, 
        user: userId 
      }).select('post');
      
      const likedPostIds = new Set(likes.map(l => l.post.toString()));

      postsWithLikes = posts.map(post => ({
        ...post,
        isLiked: likedPostIds.has(post._id.toString())
      }));
    }

    return { posts: postsWithLikes, total };
  }
}

module.exports = new PostService();

// ============================================================

